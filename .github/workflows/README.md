By default, the generation of the Hugo project with Github Actions is disabled.
To enable it, update the job `github-pages.yaml` in order to specify which branches triggers the job:

```
on:
  push:
    branches: [ 'main' ]
```