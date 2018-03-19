# compucast-assistant
Chrome extension to provide features for Compucast CMS sites

## Development

This project is using FontAwesome library, which you can upgrade via a pre-commit hook.  To use the hook, clone this repository and then run the command:

```bash
git config core.hooksPath hooks
```

Also, you may need to make the hook executable:

```bash
chmod +x hooks/pre-commit
```

This pre-commit hook will copy several files from a local copy of the FontAwesome repository and replace the versions in this repository.  You will be responsible for keeping the FontAwesome repository up to date.
