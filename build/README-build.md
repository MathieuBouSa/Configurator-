# Recompiler le CSS (uniquement si des classes changent dans js/ ou index.html)

    npx tailwindcss@3 -c build/tailwind.config.cjs -i build/tailwind-input.css -o vendor/tailwind.css --minify

Le site reste 100 % statique : `vendor/tailwind.css` est versionné, aucun build n'est nécessaire pour déployer.
