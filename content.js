// Babbel - Hide Translations
// Copyright © 2022 Adaline Valentina Simonian
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU Affero General Public License as published
// by the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU Affero General Public License for more details.
//
// You should have received a copy of the GNU Affero General Public License
// along with this program.  If not, see <https://www.gnu.org/licenses/>.

// Content Script

const browser = globalThis.browser || globalThis.chrome

/**
 * Adds the extension's CSS to the DOM.
 */
const addCSS = () => {
  const css = document.createElement('style')

  css.id = 'babbel-hide-translations-css-styles'
  css.textContent = `
    #babbel-hide-translations {
      background-color: transparent;
      background-repeat: no-repeat;
      border: none;
      cursor: pointer;
      height: 24px;
      width: 24px;
      min-width: 24px;
      min-height: 24px;
      margin: 0;
      padding: 0;
      border-radius: 4px;
    }

    #babbel-hide-translations:hover {
      background-color: rgba(0, 0, 0, 0.1);
      box-shadow: rgba(154, 68, 0, 0.5) 1px 1px 2px;
    }

    #babbel-hide-translations.hidden {
      background-image: url(${browser.runtime.getURL('icon-show.svg')});
    }

    #babbel-hide-translations.shown {
      background-image: url(${browser.runtime.getURL('icon-hide.svg')});
    }
`

  document.head.appendChild(css)

  const hideTranslationCSS = document.createElement('style')

  hideTranslationCSS.id = 'babbel-hide-translations-css'

  document.head.appendChild(hideTranslationCSS)
}

/**
 * Hides translations.
 */
const hideTranslations = () => {
  document.getElementById('babbel-hide-translations-css').textContent = `
  [data-selector="item-translation"], .item-translation {
    filter: blur(5px);
  }
`
  chrome.storage.sync.set({ hideTranslations: true })
}

/**
 * Shows translations.
 */
const showTranslations = () => {
  document.getElementById('babbel-hide-translations-css').textContent = ''

  chrome.storage.sync.set({ hideTranslations: false })
}

/**
 * Creates a button to hide translations, to be inserted into the DOM.
 */
const createButton = () => {
  const button = document.createElement('button')

  button.id = 'babbel-hide-translations'
  button.className = 'shown'
  button.title = 'Hide translations (CTRL+`)'

  const toggle = () => {
    if (button.className === 'shown') {
      button.className = 'hidden'
      button.title = 'Show translations (CTRL+`)'
      hideTranslations()
    } else {
      button.className = 'shown'
      button.title = 'Hide translations (CTRL+`)'
      showTranslations()
    }
  }

  button.addEventListener('click', toggle)
  document.addEventListener('keydown', event => {
    // CTRL+`
    if (event.ctrlKey && event.code === 'Backquote') {
      event.preventDefault()
      toggle()
    }
  })

  return button
}

/**
 * Inserts the button into the DOM.
 */
const insertButton = () => {
  const button = createButton()
  const header = document.querySelector(
    '[aria-label="right aligned menu"][as="nav"] > div:first-child'
  )

  header.prepend(button)

  return button
}

/**
 * Initializes the extension.
 */
const init = async () => {
  // If already initialized, do nothing.
  if (document.getElementById('babbel-hide-translations-css-styles')) {
    console.debug('Babbel - Hide Translations: Already initialized.')

    return
  }

  addCSS()

  const button = insertButton()
  const { hideTranslations } = await browser.storage.sync.get(
    'hideTranslations'
  )

  if (hideTranslations) {
    button.click()
  }

  console.debug('Babbel - Hide Translations: Initialized.')
}

init().catch(error => {
  console.error('Babbel - Hide Translations: Error initializing.', error)
})
