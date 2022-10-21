/*
 * NOTICE: Copyright 2022 Talend SA, Talend, Inc., and affiliates. All Rights Reserved. Customer’s use of the software contained herein is subject to the terms and conditions of the Agreement between Customer and Talend.
 */

const dropdowns= Array.prototype.slice.call(document.querySelectorAll('.js-dropdown'));
dropdowns.forEach(function initDropdown(dropdown) {
  const menuItems = Array.prototype.slice.call(dropdown.parentElement.querySelectorAll('[role="menuitem"]'));
  const menu = dropdown.parentElement.querySelector('[role="menu"]');

  /**
   * show/hide the dropdown content
   * @param show {Boolean} do we need to show the content or not
   */
  function toggle(show){
    menu.hidden = !show;
    dropdown.setAttribute('aria-expanded', show);
    const icon = dropdown.querySelector('svg');
    if (icon.classList) {
      icon.classList.toggle('dropdown__icon--active', show);
    }
    if (show) {
      const indexItemEndpointsSelected = menuItems.findIndex(menuItem => menuItem.classList.contains('dropdown__item--selected'));
      const indexItemSelected = indexItemEndpointsSelected !== -1 ? indexItemEndpointsSelected : 0;
      menuItems[indexItemSelected].focus();
    }
  }


  dropdown.addEventListener('click', function() {
    toggle(menu.hidden);
    if (menu.hidden) {
      dropdown.focus();
    }
    document.addEventListener('click', function closeDropdown(e) {
      if (e.target !== dropdown || !e.target.closest('.js-dropdown')) {
        toggle(false);
        document.removeEventListener('click', closeDropdown)
      }
    });
  });
  menuItems.forEach(function (menuItem, currentIndex) {
    menuItem.addEventListener('keydown', function (e) {
      const nextIndex = currentIndex + 1 >= menuItems.length ? 0 : currentIndex + 1,
        previousIndex = currentIndex - 1 < 0 ? menuItems.length - 1 : currentIndex - 1;
      if (e.keyCode === 40) {
        e.preventDefault()
        menuItems[nextIndex].focus();
      }
      if (e.keyCode === 38) {
        e.preventDefault()
        menuItems[previousIndex].focus();
      }
      if (e.keyCode === 27 || e.keyCode === 9) {
        toggle(false)
      }
      if (e.keyCode === 27) {
        e.preventDefault()
        dropdown.focus()
      }
    });
  });
});

const examples = Array.prototype.slice.call(document.querySelectorAll('[data-example]'));
examples.forEach(function (example) {
  example.addEventListener('click' , function(event) {
    const snippet = document.querySelector(example.getAttribute('href'));
    snippet.hidden = !snippet.hidden;
    example.hidden = !example.hidden;
    const otherExamples = Array.prototype.slice.call(example.parentElement.querySelectorAll('[data-example]'));
    otherExamples.filter(otherExample => example !== otherExample).forEach(function (otherExample) {
      otherExample.hidden = false;
      const otherSnippet = document.querySelector(otherExample.getAttribute('href'));
      otherSnippet.hidden = true;
    });
    document.querySelector(`[aria-controls="${example.parentElement.id}"] .js-dropdown-text`).textContent = example.textContent;
    event.preventDefault();
  })
})

/**
 * Escape a given string
 * @param {String} string - the string to transform
 * @return {String} A copy fo the string escaped
 */
function escapeRegExp(string) {
  return string.replace(/([.*+?^${}()|\[\]\/\\])/g, '\\$1');
}
const chars = [
  'AaÁáÀàÂâÄäAĄąȺⱥǍǎȦȧẠạĀāÃãå',
  'CcĆćĈĉÇçȻȼČčĊċ',
  'EeÉéÈèÊêËëȨȩĘęɆɇĚěĖėẸẹĒēẼẽ',
  'IiÍíÌìÎîÏïĮįƗɨǏǐİiỊịĪīĨĩ',
  'JjĴĵɈɉǰ',
  'LlĹĺĻļŁłȽƚĽľḶḷ',
  'NnŃńǸǹŅņꞤꞥŇňṅṆṇÑñ',
  'OoÓóÒòÔôÖöǪǫØøƟɵǑǒȮȯỌọŌōÕõ',
  'SsŚśŜŝŞşꞨꞩŠšṠṡṢṣ',
  'TtẗŢţȾⱦŦŧŤťṪṫṬṭ',
  'UuÚúÙùÛûÜüŲųɄʉǓǔỤụŪūŨũ',
  'YyÝýỲỳŶŷŸÿɎɏẎẏỴỵȲȳỸỹ',
  'ZzŹźẐẑƵƶŽžŻżẒẓ'
];
/**
 * Replaces the characters of a given string with their diacritical equivalents
 * @example "b[a]r" => "b[AaÁáÀàÂâÄäAĄąȺⱥǍǎȦȧẠạĀāÃãå]r"
 * @param {String} text - The string to transform
 * @return {String} A new string with the replaced characters
 */
function diacritic(text = '') {
  let result = escapeRegExp(text);
  for (let i = 0; i < chars.length; i++) { // eslint-disable-line
    result = result.replace(new RegExp(`[${ chars[i] }]`, 'gi'), `[${ chars[i] }]`);
  }
  return result;
}

/**
 * Search for matching suggestions
 * @param {Array<Node>} values - all the node
 * @param {String} term - the string to search for
 * @return {Array<Node>} The node corresponding to the given term
 */
function search(values, term) {
  const re = new RegExp(diacritic(term), 'i');
  return values.filter(
    (suggestion) => re.exec(suggestion.textContent)
  );
}

const filter = document.querySelector('.js-filter');
const values = Array.prototype.slice.call(document.querySelectorAll('.js-api-toc a'));
if (filter) {
  filter.addEventListener('input', function findContent(){
    const searchTerm = filter.value;
    const result = search(values, searchTerm);
    values.forEach(value => {
      if (result.indexOf(value) >= 0) {
        value.parentElement.removeAttribute('hidden');
      } else {
        value.parentElement.setAttribute('hidden', true)
      }
      value.innerHTML = highlightLabel(filter.value, value.textContent);
    });
  });
}

/**
 * Hightlight the searched string in the text
 * @param {String} term - the string we are looking for
 * @param {String} labelToHighlight - the text we need to highlight
 * @return {String} the text highlighted with a mark element.
 */
function highlightLabel(term, labelToHighlight) {
  if (term) {
    return labelToHighlight.replace(
      new RegExp(`(${
        diacritic(term.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'))
          .split(' ').join('|') })`, 'gi'
      ),
      '<mark>$1</mark>'
    );
  }
  return labelToHighlight;
}

const triggers = Array.prototype.slice.call(document.querySelectorAll('.js-tooltip-trigger'));
triggers.forEach(function initTooltip(trigger) {
  trigger.insertAdjacentHTML('afterend', '<div class="tooltip-wrapper"></div>')
  const target = document.querySelector(`#${trigger.getAttribute('aria-controls')}`);
  const tooltipWrapper = trigger.parentElement.querySelector('.tooltip-wrapper');
  trigger.addEventListener('click', function handleAction(event) {
    event.preventDefault();
    if(trigger.getAttribute('aria-expanded') === 'false'){
      const clonedTarget = target.cloneNode(true);
      clonedTarget.hidden = false;
      clonedTarget.classList.remove('api__description');
      trigger.setAttribute('aria-expanded', true);
      const tooltipContent = document.createElement('div');
      clonedTarget.classList.add('scrollable');
      tooltipContent.appendChild(clonedTarget);
      tooltipWrapper.appendChild(tooltipContent);
      const triggerRect = trigger.getBoundingClientRect();
      const wrapperRect = tooltipWrapper.getBoundingClientRect();
      const bodyElementSize = clonedTarget.getBoundingClientRect();
      const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
      const isTooltipBottom = bodyElementSize.top < viewportHeight/2;
      trigger.classList.toggle('tooltip--bottom', isTooltipBottom);
      tooltipContent.classList.toggle('tooltip__content--bottom', isTooltipBottom);
      tooltipContent.setAttribute('tabindex', '-1');
      tooltipContent.focus({ preventScroll: true });
      tooltipContent.classList.add('tooltip__content');
      const extraMarginPosition = 14;
      updateLeftPositionTooltipContent();
      updateScrollTopPosition();

      function updateScrollTopPosition() {
        const heightHeaderBar = 50;
        const tooltipContentPosition = tooltipContent.getBoundingClientRect();

        if(tooltipContentPosition.top < heightHeaderBar + extraMarginPosition) {
          clonedTarget.style.maxHeight = `${tooltipContentPosition.height - Math.abs(tooltipContentPosition.top) - heightHeaderBar - 2*extraMarginPosition}px`;
        } else if(tooltipContentPosition.bottom + extraMarginPosition > viewportHeight) {
          clonedTarget.style.maxHeight = `${tooltipContentPosition.height - tooltipContentPosition.bottom + viewportHeight - 2*extraMarginPosition}px`;
        }
      }
      function updateLeftPositionTooltipContent() {
        tooltipContent.style.removeProperty('left');
        const leftPositionToBeCentered = triggerRect.left - wrapperRect.left;
        let leftPositionTooltipContent = leftPositionToBeCentered;
        const tooltipContentPosition = tooltipContent.getBoundingClientRect();
        const leftTruncatedWidth = extraMarginPosition - leftPositionToBeCentered - tooltipContentPosition.left;
        if(leftTruncatedWidth > 0) {
          leftPositionTooltipContent = Math.abs(tooltipContentPosition.left) + extraMarginPosition;
        }
        const rightTruncatedWidth = leftPositionToBeCentered + extraMarginPosition + tooltipContentPosition.right - document.documentElement.clientWidth;
        if(rightTruncatedWidth > 0) {
          leftPositionTooltipContent = leftPositionToBeCentered - rightTruncatedWidth;
        }

        tooltipContent.style.left = `${leftPositionTooltipContent}px`;
      }
      function handleExit(e) {
        if (e.keyCode === 27 || e.keyCode === 9) {
          trigger.setAttribute('aria-expanded', false)
          tooltipContent.removeEventListener('keydown', handleExit);
          document.removeEventListener('click', closeTooltip);
          window.removeEventListener('resize', updateLeftPositionTooltipContent);
          tooltipWrapper.removeChild(tooltipContent);
        }
      }
      function closeTooltip(e) {
        if (e.target !== trigger && !e.target.closest('.tooltip__content')) {
          trigger.setAttribute('aria-expanded', false);
          document.removeEventListener('click', closeTooltip);
          window.removeEventListener('resize', updateLeftPositionTooltipContent);
          tooltipContent.removeEventListener('keydown', handleExit);
          tooltipWrapper.removeChild(tooltipContent);
        }
      }
      tooltipContent.addEventListener('keydown', handleExit);
      document.addEventListener('click', closeTooltip);
      window.addEventListener('resize', updateLeftPositionTooltipContent);
    }
  });
});

function debounce(func, wait, immediate) {
  let timeout;
  return function() {
    const context = this, args = arguments;
    const later = function() {
      timeout = null;
      if (!immediate) func.apply(context, args);
    };
    const callNow = immediate && !timeout;
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    if (callNow) func.apply(context, args);
  };
}

const formElement = document.querySelector('.js-search-form');
if (formElement) {
  formElement.addEventListener('submit', function (e) {e.preventDefault();});
}
if (window.matchMedia('(min-width: 35em)').matches) {
  const apiToc = document.querySelector('.js-api-toc');
  if (apiToc) {
    const anchors = Array.prototype.slice.call(apiToc.querySelectorAll('li > a'));
    const anchorTargets = anchors.map(anchor => document.querySelector(anchor.hash + '_anchor'));
    function scrollUpdate() {
      if (window.matchMedia('(min-width: 35em)').matches) {
        const fromTop = window.scrollY;
        anchors.forEach((anchor, index) => {
          const anchorTarget = anchorTargets[index];
          if (anchorTarget != null &&
            anchorTarget.offsetTop - 56 <= fromTop &&
            anchorTarget.offsetTop + anchorTarget.offsetHeight > fromTop
          ) {
            anchor.parentElement.classList.add('api-toc__item--selected');
            anchor.scrollIntoView({block: 'nearest'});
          } else {
            anchor.parentElement.classList.remove('api-toc__item--selected');
          }
        });
        if (fromTop === window.scrollMaxY) {
          apiToc.querySelector('.api-toc__item--selected').classList.remove('api-toc__item--selected')
          anchors[anchors.length - 1].parentElement.classList.add('api-toc__item--selected');
        }
      }
    }
    window.addEventListener('scroll' , debounce(scrollUpdate, 100));
  }
}
/**
 * a setTimeout is necessary here as Firefox seems to execute this script before the CSS is fully rendered.
 * This impact getBondingClientRect and no tooltip is displayed.
 */
setTimeout(function delayLayoutCalculation() {
  const apiExpandedDescriptions = Array.prototype.slice.call(document.querySelectorAll('.js-api-description-expanded'));
  apiExpandedDescriptions.forEach(function initShowMoreButton(apiExpanded) {
    const api = apiExpanded.closest('.api');
    const apiDescription = api.querySelector('.api__description');
    if(apiDescription) {
      const apiDescriptionMaxHeight = Math.round(apiDescription.getBoundingClientRect().height);
      const apiDescriptionEffectiveHeight = apiDescription.scrollHeight;
      if(apiDescriptionEffectiveHeight > apiDescriptionMaxHeight) {
        apiExpanded.classList.remove('invisible');
      } else {
        api.removeChild(apiExpanded.closest('.api__description_expanded_container'));
      }
    }
  });
}, 0);
