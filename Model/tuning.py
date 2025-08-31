import os
import logging
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt

import torch
from transformers import (
    AutoTokenizer, 
    AutoModelForSequenceClassification, 
    Trainer, 
    TrainingArguments,
    EarlyStoppingCallback
)
from datasets import Dataset, load_metric
from sklearn.model_selection import train_test_split
from typing import Dict, Any, Optional

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s: %(message)s')
logger = logging.getLogger(__name__)

class MetricsCallback(object):
    """
    A callback to track training and evaluation metrics for visualization.
    """
    def __init__(self):
        self.train_losses = []
        self.eval_losses = []
        self.eval_accuracies = []

    def __call__(self, args, state, control, model=None, **kwargs):
        if state.is_local_process_zero:
            # Log training loss
            if kwargs.get('loss') is not None:
                self.train_losses.append(kwargs['loss'])
            
            # Log evaluation metrics
            if kwargs.get('metrics') is not None:
                eval_loss = kwargs['metrics'].get('eval_loss')
                if eval_loss is not None:
                    self.eval_losses.append(eval_loss)
                
                eval_accuracy = kwargs['metrics'].get('eval_accuracy')
                if eval_accuracy is not None:
                    self.eval_accuracies.append(eval_accuracy)

def plot_training_metrics(
    metrics_callback: MetricsCallback, 
    output_dir: str
):
    """
    Generate and save plots for training and evaluation metrics.
    
    Args:
        metrics_callback (MetricsCallback): Callback containing training metrics
        output_dir (str): Directory to save plots
    """
    plt.figure(figsize=(12, 5))
    
    # Training Loss Plot
    plt.subplot(1, 2, 1)
    plt.plot(metrics_callback.train_losses, label='Training Loss', color='blue')
    plt.title('Training Loss over Epochs', fontsize=12)
    plt.xlabel('Training Steps', fontsize=10)
    plt.ylabel('Loss', fontsize=10)
    plt.legend()
    plt.grid(True, linestyle='--', alpha=0.7)
    
    # Evaluation Metrics Plot
    plt.subplot(1, 2, 2)
    
    # Plot evaluation loss if available
    if metrics_callback.eval_losses:
        plt.plot(metrics_callback.eval_losses, label='Evaluation Loss', color='red')
    
    # Plot evaluation accuracy if available
    if metrics_callback.eval_accuracies:
        plt.plot(metrics_callback.eval_accuracies, label='Evaluation Accuracy', color='green')
    
    plt.title('Evaluation Metrics over Epochs', fontsize=12)
    plt.xlabel('Evaluation Steps', fontsize=10)
    plt.ylabel('Metrics', fontsize=10)
    plt.legend()
    plt.grid(True, linestyle='--', alpha=0.7)
    
    # Adjust layout and save
    plt.tight_layout()
    plot_path = os.path.join(output_dir, 'training_metrics.png')
    plt.savefig(plot_path, dpi=300, bbox_inches='tight')
    plt.close()
    
    logger.info(f"Training metrics plot saved to {plot_path}")

def prepare_data(data_path: str) -> pd.DataFrame:
    """
    Load and preprocess the dataset with robust error handling and logging.
    
    Args:
        data_path (str): Path to the CSV file containing sentiment data
    
    Returns:
        pd.DataFrame: Preprocessed DataFrame with integer-encoded labels
    """
    try:
        # Use more robust CSV reading with multiple encodings
        encodings_to_try = ['utf-8', 'latin1', 'iso-8859-1', 'cp1252']
        for encoding in encodings_to_try:
            try:
                data = pd.read_csv(data_path, encoding=encoding)
                break
            except UnicodeDecodeError:
                continue
        else:
            raise ValueError(f"Could not read the file with any of these encodings: {encodings_to_try}")

        # Validate required columns
        required_columns = ["description", "money"]
        missing_columns = [col for col in required_columns if col not in data.columns]
        if missing_columns:
            raise ValueError(f"Missing columns: {missing_columns}")

        # Rename columns for consistency
        data = data.rename(columns={"description": "review", "money": "label"})

        # Clean and validate text data
        data['review'] = data['review'].fillna('').astype(str)
        data['review'] = data['review'].str.strip()

        # Remove empty reviews
        data = data[data['review'] != '']

        # Robust sentiment mapping
        sentiment_mapping = {
            "negative": 0, 
            "neutral": 1, 
            "positive": 2
        }
        
        # Normalize sentiment labels (case-insensitive)
        data['label'] = data['label'].str.lower().map(sentiment_mapping)

        # Validate label mapping
        if data['label'].isnull().any():
            invalid_labels = data[data['label'].isnull()]['label'].unique()
            raise ValueError(f"Invalid sentiment labels found: {invalid_labels}")

        logger.info(f"Dataset loaded successfully. Total samples: {len(data)}")
        return data

    except Exception as e:
        logger.error(f"Error in data preparation: {e}")
        raise

def compute_metrics(eval_pred):
    """
    Compute evaluation metrics for the model.
    
    Args:
        eval_pred: Predictions from the model
    
    Returns:
        Dict of evaluation metrics
    """
    metric = load_metric("accuracy")
    logits, labels = eval_pred
    predictions = np.argmax(logits, axis=-1)
    return metric.compute(predictions=predictions, references=labels)

def train_sentiment_model(
    dataset_path: str, 
    model_name: str = "cardiffnlp/twitter-roberta-base-sentiment-latest",
    output_dir: str = "./fashion_sentiment_model"
):
    """
    Create a complete training pipeline for sentiment analysis.
    
    Args:
        dataset_path (str): Path to the input CSV
        model_name (str): Pre-trained model to use
        output_dir (str): Directory to save model and outputs
    """
    # Ensure output directory exists
    os.makedirs(output_dir, exist_ok=True)

    # Prepare data
    try:
        data = prepare_data(dataset_path)
    except Exception as e:
        logger.error(f"Data preparation failed: {e}")
        return

    # Split data with stratification
    train_data, val_data = train_test_split(
        data, 
        test_size=0.2, 
        random_state=42, 
        stratify=data['label']
    )

    # Convert to Hugging Face Datasets
    train_dataset = Dataset.from_pandas(train_data)
    val_dataset = Dataset.from_pandas(val_data)

    # Initialize tokenizer and model
    tokenizer = AutoTokenizer.from_pretrained(model_name)
    model = AutoModelForSequenceClassification.from_pretrained(
        model_name, 
        num_labels=3,  # Sentiment classes
        problem_type="single_label_classification"
    )

    # Tokenization with dynamic padding and advanced preprocessing
    def tokenize_function(examples):
        return tokenizer(
            examples['review'], 
            padding='max_length', 
            truncation=True, 
            max_length=128,
            return_tensors='pt'
        )

    # Prepare tokenized datasets
    train_dataset = train_dataset.map(tokenize_function, batched=True)
    val_dataset = val_dataset.map(tokenize_function, batched=True)

    # Set format for PyTorch
    train_dataset.set_format('torch', columns=['input_ids', 'attention_mask', 'label'])
    val_dataset.set_format('torch', columns=['input_ids', 'attention_mask', 'label'])

    # Detect and use GPU if available
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    logger.info(f"Training on: {device}")
    model.to(device)

    # Create metrics callback
    metrics_callback = MetricsCallback()

    # Advanced training arguments
    training_args = TrainingArguments(
        output_dir=output_dir,
        learning_rate=2e-5,
        per_device_train_batch_size=16,  # Increased batch size
        per_device_eval_batch_size=16,
        num_train_epochs=5,
        weight_decay=0.01,
        evaluation_strategy="epoch",
        save_strategy="epoch",
        load_best_model_at_end=True,
        metric_for_best_model="accuracy",
        logging_dir=os.path.join(output_dir, 'logs'),
        logging_steps=10,
        fp16=torch.cuda.is_available(),  # Mixed precision training if GPU available
    )

    # Initialize Trainer with early stopping and metrics callback
    trainer = Trainer(
        model=model,
        args=training_args,
        train_dataset=train_dataset,
        eval_dataset=val_dataset,
        tokenizer=tokenizer,
        compute_metrics=compute_metrics,
        callbacks=[
            EarlyStoppingCallback(early_stopping_patience=3),
            metrics_callback
        ]
    )

    # Start training
    try:
        logger.info("Starting model training...")
        train_result = trainer.train()

        # Evaluate the model
        eval_results = trainer.evaluate()
        logger.info(f"Evaluation Results: {eval_results}")

        # Save the best model and tokenizer
        trainer.save_model(os.path.join(output_dir, 'best_model'))
        tokenizer.save_pretrained(os.path.join(output_dir, 'tokenizer'))

        # Generate and save training metrics plots
        plot_training_metrics(metrics_callback, output_dir)

        logger.info(f"Training completed. Model saved to {output_dir}")

    except Exception as e:
        logger.error(f"Training failed: {e}")
        raise

def main():
    """
    Main execution function for sentiment analysis model training.
    """
    # Update this path to your local dataset
    dataset_path = "./train.csv"
    
    # Run training
    train_sentiment_model(dataset_path)

if __name__ == "__main__":
    main()