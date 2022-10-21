<!--
  NOTICE: Copyright 2022 Talend SA, Talend, Inc., and affiliates. All Rights Reserved. Customer’s use of the software contained herein is subject to the terms and conditions of the Agreement between Customer and Talend.
-->
# Changelog
## 1.1.0 :label: `build-v1.1.0`
### New features
  * TAD-2291: Added an `api-list` parameter which allows to configure the landing page type: API list or custom
  * Added the ability to choose which published endpoint to use in API Tester. Note: it is required to use the new API Portal Content format version 1.1 (i.e. you need to republish your APIs from API Designer)

### Changes
  * TAD-2325: The Talend theme folder is now called `talend` (version is no longer displayed)

### Fixes
  * ADT-69: Missing favicon on Chrome based browsers
  * ADT-71: Fixed display issues when multiple bodies are used in operation requests and responses
  * ADT-72: Fixed display issue for body dropdowns
  * ADT-73: Fixed display issue with datatype exemples
  * ADT-77: Fixed several UI issues in Safari
  * ADT-80: Improved the tooltip UI component
  * TAD-2321: Fixed display issue with API title and versions
  * TAD-2212: Fixed link to Talend documentation in readme.md file
  * TAD-2215: Fixed incorrect grid on mobile devices
  * TAD-2240: Fixed layout issue for custom documentation pages, not always centered horizontally and too narrow
  * TAD-2243: Fixed layout for the API list page in resolution lower than 1500px
  * TAD-2241: Fixed display issue for "enum badges"
  * TAD-2242: Fixed display issue with Try in API Tester and Download buttons
  * TAD-2287: Fixed API portal generation issue occurring with "object" example fields

## 1.0.0 :label: `build-v1.0.0`
### New features
  * Initial version
