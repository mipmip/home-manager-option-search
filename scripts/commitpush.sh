if [[ ! -z "$(git diff --exit-code)" ]]; then
    git add ./data/options.json
    git commit -m "automatic update options.json"
    git pull --rebase origin main
    git push origin main
else
    echo "nothings changed will not commit anything"
fi

