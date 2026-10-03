# ML notebook

Run the full pipeline via script (notebook-friendly):

```bash
python ml/train.py
```

Then open `ml/artifacts/metadata.json` and `model_comparison.json` for PPT slides.

For Jupyter, copy cells from `ml/train.py` or run:

```bash
pip install jupyter
jupyter lab
```

Recommended EDA: load `ml/artifacts/synthetic_srs_reviews.csv` and plot `elapsed_days_since_last_review` vs `will_forget`.
