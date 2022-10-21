<!--
  NOTICE: Copyright 2022 Talend SA, Talend, Inc., and affiliates. All Rights Reserved. Customer’s use of the software contained herein is subject to the terms and conditions of the Agreement between Customer and Talend.
-->

# API Portal Template

## Table of Contents

1. [General Information](#general-information)
2. [Installation](#installation)
3. [Add your APIs](#add-your-apis)
4. [Repository architecture](#repository-architecture)

## General information

This repository is used as a template for the Talend API Portal based on HUGO.

Useful links:
- [API Portal documentation](https://help.talend.com/access/sources/content/topic?pageid=designer_api_portal&EnrichVersion=Cloud&afs:lang=en)
- [HUGO documentation](https://gohugo.io/documentation/)

## Installation

1. [Install Hugo](https://gohugo.io/overview/installing/).
2. Clone this repository.
3. Run Hugo:
```bash
# Start the server
hugo server

# Or start the server with building draft files
hugo server -D
```
4. Visit your API Portal on your browser.

## Add your APIs

There are 2 different ways to add APIs into the Portal:
1. By using API Designer. See [documentation](https://help.talend.com/access/sources/content/topic?pageid=designer_configure_portal_ui&EnrichVersion=Cloud&afs:lang=en) for more information.
2. By using the management API. See [documentation](https://help.talend.com/access/sources/content/topic?pageid=designer_api_portal_fetch_documentation&EnrichVersion=Cloud&afs:lang=en) for more information.

## Repository architecture

API Portal repository looks like this by default:

```
.
├── apis
│   └── _index.md
├── assets
│   └── css
│       └── 02_variables.css
├── CHANGELOG.md
├── config.toml
├── content
│   ├── getting-started.md
│   └── _index.md
├── NOTICE
├── README.md
├── static
│   └── img
│       └── brand-logo.png
└── themes
    └── ...
```

An overview of what each of these directories or files are using for:

| Directory / File | Description                                                                                                                                                                                                                                                                                                                                                                                                                                         |
|------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| apis             | Contains the API documentation to publish. It should have a folder for each API, and each of these should contain a folder per version. The documentation for an API version should be located in `apis/<api-name>/<api-version>/index.md`. Other definition formats such as `OAS3` or `Swagger 2` could be located in `apis/<api-name>/<api-version>/` based on your configuration. These formats will be only used in case of download of an API. |
| assets           | Contains files managed by the user, such as `JavaScript` and `CSS` files. The following file `assets/css/02_variables.css` is provided by default in order to allow you to overwrite some `CSS` rules to customize easily your Portal. Feel free to change it.                                                                                                                                                                                      |
| CHANGELOG.md     | A log of all notable changes made to the project.                                                                                                                                                                                                                                                                                                                                                                                                   |
| config.toml      | The configuration file for a HUGO project. It contains the configuration for the portal. It specifies the theme to use when generating the site. Also, this configuration allows you to change the site name and to organize your APIs into categories.                                                                                                                                                                                             |
| content          | Contains any other page that you want to include in your portal. By default it contains a landing page and a "Getting started" page.                                                                                                                                                                                                                                                                                                                |
| NOTICE           | The repository notice. Make sure you have read it.                                                                                                                                                                                                                                                                                                                                                                                                  |
| README.md        | /                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| static           | Contains static files managed by the user, such as images and fonts. By default there is only `img/brand-logo.png` which is the image used in the header.                                                                                                                                                                                                                                                                                           |
| themes           | Contains the themes necessary to make the portal working. Talend provides a default API Portal Theme.                                                                                                                                                                                                                                                                                                                                               |
