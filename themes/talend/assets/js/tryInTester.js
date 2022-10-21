/*
 * NOTICE: Copyright 2022 Talend SA, Talend, Inc., and affiliates. All Rights Reserved. Customer’s use of the software contained herein is subject to the terms and conditions of the Agreement between Customer and Talend.
 */
const TESTER_PAID_ID = 'ndhpdjlmagefginpimmegdninnnkodgo';
const TESTER_FREE_ID = 'aejoelaoggembcahagimdiliamlcdmfm';
const TESTER_FREE_INSTALL_URL = 'https://chrome.google.com/webstore/detail/aejoelaoggembcahagimdiliamlcdmfm';
const MINIMUM_VERSION_API_TESTER_REQUIRED = '25.7.0';

const isNullOrUndefined = (item) => {
  return item == null;
};

const apiContextMeta = document.querySelector('[name=try-in-tester-api-context]');
let API_CONTEXT;
if (!isNullOrUndefined(apiContextMeta)) {
  API_CONTEXT = JSON.parse(apiContextMeta.content);
}

const metaItemTryInTesterConfig = document.querySelector('[name=try-in-tester-configuration]');
let CONFIG_TRYIN;
if (!isNullOrUndefined(metaItemTryInTesterConfig)) {
  CONFIG_TRYIN = JSON.parse(metaItemTryInTesterConfig.getAttribute('content'));
}

const dropdownItemsEndpoints = Array.from(document.querySelectorAll('.js-try-in-tester-endpoint'));
dropdownItemsEndpoints.forEach((dropdownItemEndpoints) => {
  dropdownItemEndpoints.addEventListener('click', (e) => {
    e.preventDefault();
    const endpointIndex = [ ...dropdownItemEndpoints.parentElement.children ].indexOf(dropdownItemEndpoints);
    const endpointUrl = dropdownItemEndpoints.getAttribute('data-endpoint-url');
    updateSelectedEndpointInDropdowns(endpointIndex, endpointUrl);
  });
});

const updateSelectedEndpointInDropdowns = (indexSelectedEndpoint, endpointUrl) => {
  dropdownItemsEndpoints.forEach((dropdownItemEndpoints) => {
    dropdownItemEndpoints.classList.remove('dropdown__item--selected');
    const currentIndex = [ ...dropdownItemEndpoints.parentElement.children ].indexOf(dropdownItemEndpoints);
    if (currentIndex === indexSelectedEndpoint) {
      dropdownItemEndpoints.classList.add('dropdown__item--selected');
    }
    const tryInButton = dropdownItemEndpoints.closest('.js-try-in-tester').querySelector('.js-try-in-tester--action');
    tryInButton.setAttribute('data-endpoint-url', endpointUrl);
  });
};

const firstButtonEndpointUrl = document.querySelector('.js-try-in-tester-endpoint');
if (!isNullOrUndefined(firstButtonEndpointUrl)) {
  const endpointUrlToSelect = firstButtonEndpointUrl.getAttribute('data-endpoint-url');
  updateSelectedEndpointInDropdowns(0, endpointUrlToSelect);
}

let activeTryInTesterButton;
const tryInTesterApiButtons = Array.from(document.querySelectorAll('.js-api-try-in-tester'));
tryInTesterApiButtons.forEach((tryInTesterApiButton) => {
  tryInTesterApiButton.addEventListener('click', (e) => {
    e.preventDefault();
    activeTryInTesterButton = tryInTesterApiButton;
    const endpointUrl = tryInTesterApiButton.getAttribute('data-endpoint-url');
    tryApiInTester(endpointUrl);
  });
});

const tryInTesterOperationButtons = Array.from(document.querySelectorAll('.js-operation-try-in-tester'));
tryInTesterOperationButtons.forEach((tryInTesterOperationButton) => {
  tryInTesterOperationButton.addEventListener('click', (e) => {
    e.preventDefault();
    activeTryInTesterButton = tryInTesterOperationButton;
    const operationId = tryInTesterOperationButton.getAttribute('data-operation-id');
    const endpointUrl = tryInTesterOperationButton.getAttribute('data-endpoint-url');
    tryOperationInTester(operationId, endpointUrl);
  });
});

document.addEventListener('click', (e) => {
  closeUpgradeModal(e.target);
});

const upgradeTesterModal = document.getElementById('try-in-tester-version-modal');

const tryOperationInTester = (operationId = '', endpointUrl) => {
  const processOperationInTester = (testerId, apiTesterFormat6, tryInTesterMessageType) => {
    const payload = buildPayloadForOperation(apiTesterFormat6, operationId, endpointUrl);
    if (payload) {
      postTryInTesterMessage(
        testerId,
        tryInTesterMessageType,
        payload
      );
    }
  };

  fetchApiTesterFormat6().then((apiTesterFormat6) => {
    if (apiTesterFormat6) {
      const testerId = getInstalledTesterOrOpenChromeStoreIfNeeded();
      if (testerId) {
        const noEnvironmentProvided = isNullOrUndefined(apiTesterFormat6?.environments) || apiTesterFormat6?.environments?.length < 1;
        if (noEnvironmentProvided) {
          processOperationInTester(testerId, apiTesterFormat6,'openRequest');
        } else if (isRequiredMinimumTesterVersionInstalledOrOpenModal(testerId)) {
          processOperationInTester(testerId, apiTesterFormat6,'openParameterizedRequest');
        }
      }
    }
  });
};

const fetchApiTesterFormat6 = () => {
  return fetch(API_CONTEXT.etnResource6Url)
    .then((response) => {
      if (response.ok) {
        return Promise.resolve(response.json());
      } else {
        return Promise.reject('Impossible to fetch the entity tree node.');
      }
    })
    .then((data) => {
      const entityTreeNode = data.entities[ 0 ];
      if (isNullOrUndefined(entityTreeNode)) {
        return Promise.reject('apitesterformat6.json is malformed');
      }
      return Promise.resolve({ entityTreeNode, environments: data.environments || [] });
    });
};

const retrieveEntityFromOperationId = (arrayEntityObjects, operationId) => {
  let entityObject;
  arrayEntityObjects.some(function findOperation (nestedEntity) {
    if (nestedEntity.entity.id === operationId) {
      entityObject = nestedEntity;
      return true;
    }
    return nestedEntity.children?.some(findOperation);
  });
  return entityObject;
};

const retrieveEnvironmentFromEndpointUrl = (endpointUrl, environments) => {
  const isObjectContainsValue = (obj, value) => {
    return !isNullOrUndefined(
      Object.values(obj).find((item) => {
        if (typeof item === 'object') {
          return isObjectContainsValue(item, value);
        }
        return item === value;
      }),
    );
  };

  if (isNullOrUndefined(environments) || environments.length === 0) {
    return null;
  }
  if (isNullOrUndefined(endpointUrl)) {
    return environments[ 0 ];
  }
  for (const environment of environments) {
    if (isObjectContainsValue(environment, endpointUrl)) {
      return environment;
    }
  }
  return environments[ 0 ];
};

const buildPayloadForOperation = (apiTesterFormat6Updated, operationId, endpointUrl) => {
  const entityObject = retrieveEntityFromOperationId(apiTesterFormat6Updated.entityTreeNode.children, operationId);
  if (isNullOrUndefined(entityObject) || isNullOrUndefined(entityObject.entity)) {
    return null;
  }
  const environments = apiTesterFormat6Updated?.environments;
  if (isNullOrUndefined(environments) || environments.length < 1) {
    return entityObject.entity;
  } else {
    const selectedEnvironment = retrieveEnvironmentFromEndpointUrl(endpointUrl, environments);
    return {
      request: entityObject.entity,
      environment: selectedEnvironment || {},
    };
  }
};

const getTesterVersion = (testerId) => {
  const testerInstall = getTesterInstall(testerId);
  if (testerInstall) {
    return testerInstall.dhcVersion;
  }
};

const getTesterVersionWithoutPatch = (testerId) => {
  const testerVersion = getTesterVersion(testerId);
  if (testerVersion) {
    return /^([0-9]+\.[0-9]+\.[0-9]+)(\.[0-9]+)?$/.exec(testerVersion)[ 1 ];
  }
};

/**
 * Compares versions, Tester version can be of format 'i.j.k' or 'i.j.k.l'.
 * If it's the latter we ignore the end starting from the 3rd dot.
 *
 * @param testerVersion - Tester's current version
 * We do not support comparisons with more than 3 numbers.
 */
const isTesterVersionEqualOrHigherThan = (testerVersion = '1.0.0', minimumVersionApiTesterRequired) => {
  const minimumRequiredVersionNumbers = minimumVersionApiTesterRequired.split('.').map((stringNumber) => parseInt(stringNumber, 10));
  const testerVersionNumbers = testerVersion.split('.').map((stringNumber) => parseInt(stringNumber, 10));
  for (let i = 0; i < minimumRequiredVersionNumbers.length; i++) {
    if (isNullOrUndefined(testerVersionNumbers[ i ])) return false;
    if (minimumRequiredVersionNumbers[ i ] > testerVersionNumbers[ i ]) return false;
    if (minimumRequiredVersionNumbers[ i ] < testerVersionNumbers[ i ]) return true;
  }
  return true;
};

const openUpgradeModal = (testerVersion) => {
  const currentVersionTesterDOM = document.getElementById('js-current-version-tester');
  if (!isNullOrUndefined(currentVersionTesterDOM)) {
    currentVersionTesterDOM.innerText = testerVersion;
  }
  const minimumVersionTesterDOM = document.getElementById('js-minimum-version-tester');
  if (!isNullOrUndefined(minimumVersionTesterDOM)) {
    minimumVersionTesterDOM.innerText = MINIMUM_VERSION_API_TESTER_REQUIRED;
  }

  upgradeTesterModal.hidden = false;
  upgradeTesterModal.focus();
  // There is only link or button in our modal, we don't need to query every selectables elements right now
  const focusableEls = upgradeTesterModal.querySelectorAll('a[href]:not([disabled]), button:not([disabled])');
  const firstFocusableEl = focusableEls[ 0 ];
  const lastFocusableEl = focusableEls[ focusableEls.length - 1 ];
  upgradeTesterModal.addEventListener('keydown', (e) => {
    const keyPressed = e.key;
    if (keyPressed !== 'Escape' && keyPressed !== 'Tab') {
      return;
    }
    if (keyPressed === 'Escape') {
      closeUpgradeModal();
      return;
    }

    const { activeElement } = document;
    if (e.shiftKey) /* shift + tab */ {
      if (activeElement === firstFocusableEl || activeElement === upgradeTesterModal) {
        lastFocusableEl.focus();
        e.preventDefault();
      }
    } else /* tab */ if (activeElement === lastFocusableEl) {
      firstFocusableEl.focus();
      e.preventDefault();
    }
  });
};

const isRequiredMinimumTesterVersionInstalledOrOpenModal = (testerId) => {
  const testerVersion = getTesterVersionWithoutPatch(testerId);
  if (testerVersion) {
    if (!isTesterVersionEqualOrHigherThan(testerVersion, MINIMUM_VERSION_API_TESTER_REQUIRED)) {
      openUpgradeModal(testerVersion);
      return false;
    }
    return true;
  }
  return false;
};

const closeUpgradeModal = (itemClicked) => {
  if (isNullOrUndefined(itemClicked) || itemClicked.classList.contains('js-close-modal')) {
    upgradeTesterModal.hidden = true;
    activeTryInTesterButton.focus();
  }
};

const tryApiInTester = (endpointUrl) => {
  const processApiInTester = (testerId, apiTesterFormat6) => {
    const payload = buildPayloadForApi(apiTesterFormat6, endpointUrl);
    postTryInTesterMessage(
      testerId,
      'openApi',
      payload
    );
  };

  fetchApiTesterFormat6().then((apiTesterFormat6) => {
    if (apiTesterFormat6) {
      const testerId = getInstalledTesterOrOpenChromeStoreIfNeeded();
      if (testerId) {
        const noEnvironmentProvided = isNullOrUndefined(apiTesterFormat6?.environments) || apiTesterFormat6?.environments?.length < 1;
        if (noEnvironmentProvided) {
          processApiInTester(testerId, apiTesterFormat6);
        } else if (isRequiredMinimumTesterVersionInstalledOrOpenModal(testerId)) {
          processApiInTester(testerId, apiTesterFormat6);
        }
      }
    }
  });
};

const buildPayloadForApi = (apiTesterFormat6, endpointUrl) => {
  const selectedEnvironment = retrieveEnvironmentFromEndpointUrl(endpointUrl, apiTesterFormat6.environments);
  return {
    apiMetadata: {},
    entityTreeNode: apiTesterFormat6.entityTreeNode,
    environments: selectedEnvironment ? [ selectedEnvironment ] : []
  };
};

const getInstalledTesterOrOpenChromeStoreIfNeeded = () => {
  if (isChromeBrowser()) {
    const testerId = getTesterIdInstalled();
    if (testerId) {
      return testerId;
    }
  }
  window.open(TESTER_FREE_INSTALL_URL, '_blank');
  return null;
};

const isChromeBrowser = () => {
  // Source https://stackoverflow.com/a/13348618
  const isChromium = window.chrome;
  const winNav = window.navigator;
  const vendorName = winNav.vendor;
  const isOpera = typeof window.opr !== 'undefined';
  const isIEedge = winNav.userAgent.indexOf('Edge') > -1;
  const isIOSChrome = winNav.userAgent.match('CriOS');

  if (isIOSChrome) {
    return true;
  } else if (isChromium !== null && typeof isChromium !== 'undefined' && vendorName === 'Google Inc.' && isOpera === false && isIEedge === false) {
    return true;
  } else {
    return false;
  }
};

const getTesterIdInstalled = () => {
  if (CONFIG_TRYIN && CONFIG_TRYIN.testerextensionid) {
    return CONFIG_TRYIN.testerextensionid;
  }
  if (isTesterInstalled(TESTER_PAID_ID)) {
    return TESTER_PAID_ID;
  }
  if (isTesterInstalled(TESTER_FREE_ID)) {
    return TESTER_FREE_ID;
  }
  return null;
};

const isTesterInstalled = (testerId) => {
  const testerInstall = getTesterInstall(testerId);
  return !isNullOrUndefined(testerInstall);
};

const getTesterInstall = (testerId) => {
  const testerConfigurations = Array.prototype.slice.call(document.querySelectorAll('#dhcIndicator'))
    .map((node) => node.innerText)
    .map((innerText) => JSON.parse(innerText));

  return testerConfigurations
    .find((testerInstall) => testerInstall.extensionId === testerId);
};

/*
In the following function, keys of JSON objects are set in lowercase.
Indeed, they are retrieved from a JSON object in the DOM (meta element) and HUGO transforms keys in lowercase.
 */
const postTryInTesterMessage = (testerId, type, payload) => {

  const defaultIsDevMode = false;
  const defaultQueryStringParameter = '';

  function getTryInTesterConfig () {
    if (isNullOrUndefined(CONFIG_TRYIN)) {
      return {
        isdevmode: defaultIsDevMode,
        querystringparameter: defaultQueryStringParameter,
        testerextensionid: testerId
      };
    } else {
      return updateTryInTesterConfig(CONFIG_TRYIN);
    }
  }

  function updateTryInTesterConfig ({ isdevmode = defaultIsDevMode, querystringparameter = defaultQueryStringParameter, testerextensionid = testerId }) {
    return { isdevmode, querystringparameter, testerextensionid };
  }

  const tryInTesterConfig = getTryInTesterConfig();
  const message = {
    isDevMode: tryInTesterConfig.isdevmode,
    payload,
    payloadType: payload ? 'apiTester' : 'none',
    queryString: tryInTesterConfig.querystringparameter,
    source: 'API Portal',
    target: tryInTesterConfig.testerextensionid,
    type,
    shouldReplaceOriginTab: false,
  };
  window.postMessage(message, window.location.origin);
};
