When editing the demo knowledge base, sync to the web app:

```bash
cp ml/concepts/ml-concepts.json apps/web/src/data/ml-concepts.json
cp ml/concepts/prop-map.json apps/web/src/data/prop-map.json
cp ml/artifacts/metadata.json apps/web/src/data/model-metadata.json
```

`ml/concepts/` remains the canonical copy for docs and backend references.
