(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define([], factory);
    } else if (typeof module === 'object' && typeof exports === 'object') {
        module.exports = factory();
    } else {
        root.TagsInput = factory();
    }
})(this, function () {
    'use strict';
    var allInitializedElements, keyMap, defaultOptions, extend, strToEl, tagsIdentityCount, assignDeep, getTypeOf;
    tagsIdentityCount = 1;
    allInitializedElements = {};

    keyMap = {
        13: 'ENTER',
        27: 'ESCAPE',
        40: 'DOWN_ARROW',
        38: 'UP_ARROW',
        8: 'BACKSPACE'
    };

    defaultOptions = {
        debounce: 500,
        placeholder: 'Select',
        placeholderSearch: 'Search',
        searchOnEnter: true,
        searchOption: true,
        minCharacters: 3,
        maxTags: -1,
        items: [],
        choices: [],
        classes: {
            container: 'tags-input__container',
            wrapper: 'tags-input__wrapper',
            input: 'tags-input__input',
            list: 'tags-input__list',
            option: 'tags-input__option',
            optionHighlight: 'tags-input__option--highlighted',
            optionSelected: 'tags-input__option--selected',
            selectedItem: 'tags-input__item',
            selectDisplay: 'tags-input__display',
            removeIcon: 'tags-input__item__remove',
            itemWrapper: 'tags-input__item-wrapper',
            listWrapper: 'tags-input__multi-wrapper',
            multiselectInput: 'tags-input__input--multi',
            caretSign: 'tags-input__caret',
            loading: 'tags-input__loading'
        },
        templates: {
            container: '<div class="%CONTAINER_CLASS%"></div>',
            wrapper: '<div class="%WRAPPER_CLASS%" data-tags-element="item-wrapper"></div>',
            caretSign: '<span class="%CARET_CLASS%" data-tags-element="caret">&#9660;</span>',
            selectDisplay: '<div class="%SINGLE_SELECT_ITEM_CLASS%" data-tags-element="display-holder">%PLACEHOLDER%</div>',
            input: '<input class="%INPUT_CLASS%" data-tags-element="input" placeholder="%PLACEHOLDER%" />',
            list: '<ul class="%LIST_CLASS%" data-tags-element="list"></ul>',
            listItem: '<li class="%OPTION_CLASS%" data-tags-element="option" data-index="%INDEX%" data-key="%KEY%" data-value="%VALUE%">%VALUE%</li>',
            listWrapper: '<div class="%MULTI_WRAPPER_CLASS%" data-tags-element="multiselect-wrapper"></div>',
            selectedItemWrapper: '<span class="%ITEM_WRAPPER_CLASS%" data-tags-element="selected-item-wrapper"></span>',
            selectedItem: '<span class="%ITEM_CLASS%" data-key="%KEY%" data-tags-element="selected-item">%VALUE%</span>',
            removeIcon: '<span class="%REMOVE_ITEM_CLASS%" data-tags-element="remove-item">X</span>',
            loading: '<div class="%LOADING_CLASS%" style="display:none;" data-tags-element="loading">%LOADING_TEXT%</div>'

        },
        key: 'id',
        value: 'name',
        searchBy: 'value',
        fromServer: false,
        onInit: null,
        onItemCreate: null,
        onItemSelect: null,
        onItemRemove: null,
        loadingText: 'Loading'
    };

    getTypeOf = function getTypeOf(obj) {
        return Object.prototype.toString.call(obj).slice(8, -1);
    }

    assignDeep = function assignDeep(target, varArgs) { // .length of function is 2
        'use strict';
        if (target == null) { // TypeError if undefined or null
            throw new TypeError('Cannot convert undefined or null to object');
        }

        var to = Object(target);

        for (var index = 1; index < arguments.length; index++) {
            var nextSource = arguments[index];

            if (nextSource != null) { // Skip over if undefined or null
                for (var nextKey in nextSource) {
                    // Avoid bugs when hasOwnProperty is shadowed
                    if (Object.prototype.hasOwnProperty.call(nextSource, nextKey)) {
                        if (Object.prototype.toString.call(nextSource[nextKey]) === '[object Object]') {
                            if (!to[nextKey]) {
                                to[nextKey] = {};
                            }
                            to[nextKey] = assignDeep(to[nextKey], nextSource[nextKey]);
                        } else {
                            to[nextKey] = nextSource[nextKey];
                        }
                    }
                }
            }
        }
        return to;
    };

    extend = function () {
        var args, returnObject, prop, i;
        args = Array.prototype.slice.call(arguments);
        returnObject = assignDeep.apply(null, args);
        return returnObject;
    }

    strToEl = (function () {
        var tempEl, r
        tempEl = document.createElement('div');
        return function (str) {
            tempEl.innerHTML = str;
            r = tempEl.children[0];
            while (tempEl.firstChild) {
                tempEl.removeChild(tempEl.firstChild);
            }
            return r;
        };
    }());

    function TagsInput(element, userOptions) {
        var elements, i, e1;
        if (getTypeOf(element) === 'String') {
            elements = document.querySelectorAll(element);
            if (elements.length > 1) {
                i = 1;
                for (; i < elements.length; i++) {
                    e1 = elements[i];
                    new TagsInput(e1, userOptions);
                }
            }
            element = elements[0];
        } else {
            element = element;
        }
        if (element && element.dataset.tagsId) {
            return allInitializedElements[element.dataset.tagsId];
        }
        element.dataset.tagsId = tagsIdentityCount;
        userOptions = userOptions || {};
        this.highlightPosition = -1;
        this.config = extend(defaultOptions, userOptions);
        this.element = getTypeOf(element) === 'String' ? document.querySelector(element) : element;
        this.type = element.dataset.tagsType;
        this.isListVisible = false;
        this.prevText = '';
        this.selectedItems = [];
        this.data = [];
        this.isListPopulated = false;
        this.currentTimerId = null;
        this.init();
    }

    TagsInput.prototype.init = init;
    TagsInput.prototype.getValues = getValues;
    TagsInput.prototype.setEnabled = setEnabled;
    TagsInput.prototype._render = _render;
    TagsInput.prototype._clearList = _clearList;
    TagsInput.prototype._createTemplates = _createTemplates;
    TagsInput.prototype._createInput = _createInput;
    TagsInput.prototype._getTemplate = _getTemplate;
    TagsInput.prototype._populateList = _populateList;
    TagsInput.prototype._handleInputChange = _handleInputChange;
    TagsInput.prototype._handleMouseOver = _handleMouseOver;
    TagsInput.prototype._handleMouseOut = _handleMouseOut;
    TagsInput.prototype._handleKeyPress = _handleKeyPress;
    TagsInput.prototype._handleEscape = _handleEscape;
    TagsInput.prototype._handleEnter = _handleEnter;
    TagsInput.prototype._handleDownArrow = _handleDownArrow;
    TagsInput.prototype._handleUpArrow = _handleUpArrow;
    TagsInput.prototype._hightlightElement = _hightlightElement;
    TagsInput.prototype._pushItem = _pushItem;
    TagsInput.prototype._selectElement = _selectElement;
    TagsInput.prototype._removeElement = _removeElement;
    TagsInput.prototype._clearInput = _clearInput;
    TagsInput.prototype._searchList = _searchList;
    TagsInput.prototype._removeInput = _removeInput;
    TagsInput.prototype._setLoading = _setLoading;

    function _createTemplates() {
        var classes = this.config.classes;
        var templateStrings = this.config.templates;
        this.templates = {
            container: function () {
                return strToEl(templateStrings.container
                    .replace(/%CONTAINER_CLASS%/g, classes.container));
            },
            wrapper: function () {
                return strToEl(templateStrings.wrapper
                    .replace(/%WRAPPER_CLASS%/g, classes.wrapper));
            },
            caretSign: function () {
                return strToEl(templateStrings.caretSign
                    .replace(/%CARET_CLASS%/g, classes.caretSign));
            },
            selectDisplay: function () {
                return strToEl(templateStrings.selectDisplay
                    .replace(/%SINGLE_SELECT_ITEM_CLASS%/g, classes.selectDisplay)
                    .replace(/%PLACEHOLDER%/g, this.config.placeholder));
            },
            input: function (placeholder, inputClass) {
                inputClass = inputClass || classes.input;
                return strToEl(templateStrings.input
                    .replace(/%INPUT_CLASS%/g, inputClass)
                    .replace(/%PLACEHOLDER%/g, placeholder));
            },
            list: function () {
                return strToEl(templateStrings.list
                    .replace(/%LIST_CLASS%/g, classes.list));
            },
            listItem: function (index, key, value) {
                return strToEl(templateStrings.listItem
                    .replace(/%OPTION_CLASS%/g, classes.option)
                    .replace(/%INDEX%/g, index)
                    .replace(/%KEY%/g, key)
                    .replace(/%VALUE%/g, value));
            },
            listWrapper: function () {
                return strToEl(templateStrings.listWrapper
                    .replace(/%MULTI_WRAPPER_CLASS%/g, classes.listWrapper))
            },
            selectedItemWrapper: function () {
                return strToEl(templateStrings.selectedItemWrapper
                    .replace(/%ITEM_WRAPPER_CLASS%/g, classes.itemWrapper));
            },
            selectedItem: function (key, value) {
                return strToEl(templateStrings.selectedItem
                    .replace(/%ITEM_CLASS%/g, classes.selectedItem)
                    .replace(/%KEY%/g, key)
                    .replace(/%VALUE%/g, value));
            },
            removeIcon: function () {
                return strToEl(templateStrings.removeIcon
                    .replace(/%REMOVE_ITEM_CLASS%/g, classes.removeIcon));
            },
            loading: function (loadingText) {
                return strToEl(templateStrings.loading
                    .replace(/%LOADING_CLASS%/g, classes.loading)
                    .replace(/%LOADING_TEXT%/g, loadingText));
            }
        };
    }

    function _getTemplate(template) {
        var args, templates;
        args = Array.prototype.slice.call(arguments, 1);
        if (!template) return;
        templates = this.templates;
        return templates[template].apply(this, args);
    }

    function _render(isFilter) {
        var data, list, keyAttr, valAttr, itemEl, isListWrapperPresent, d, listWrapper, input, attributeToBeUsed, fn;

        list = this._getTemplate('list');
        keyAttr = this.config.key;
        valAttr = this.config.value;
        if (this.config.searchBy === 'key') {
            attributeToBeUsed = keyAttr;
        } else {
            attributeToBeUsed = valAttr;
        }
        if (isFilter) { // Search using searchBy criteria locally if isFilter is true
            data = this.data.filter(function (item) {
                return item[attributeToBeUsed].toString().toLowerCase().indexOf(this.prevText) !== -1;
            }.bind(this));
        } else {
            data = this.data;
        }
        if (data && data.length) {
            data.forEach(function (item, index) {
                if (getTypeOf(item[keyAttr]) === 'String' && getTypeOf(item[valAttr]) === 'String') {
                    itemEl = this._getTemplate('listItem', index, item[keyAttr], item[valAttr]);
                    if (_isItemPresentInList(item, this.selectedItems, this.config.key, 'key')) {
                        itemEl.classList.add(this.config.classes.optionSelected);
                    }
                    itemEl.addEventListener('mouseover', _handleMouseOver.bind(this));
                    itemEl.addEventListener('mouseout', _handleMouseOut.bind(this));
                    itemEl.addEventListener('click', _handleMouseClick.bind(this));
                    list.appendChild(itemEl);
                    if (getTypeOf(this.config.onItemCreate) === 'Function') {
                        fn = this.config.onItemCreate;
                        _callCallback.call(this, fn);
                    }
                }
            }.bind(this));
            isListWrapperPresent = true;
            d = document.createDocumentFragment();
            listWrapper = this.container.querySelector('[data-tags-element="multiselect-wrapper"]');
            if (!listWrapper) {
                listWrapper = this._getTemplate('listWrapper');
                isListWrapperPresent = false;
            }

            // Add Search box in multiselect dropdown if searchOption is enabled
            if (this.type === 'multi-select' && this.config.searchOption) {
                if (!isListWrapperPresent) {
                    input = this._getTemplate('input', this.config.placeholderSearch, this.config.classes.multiselectInput);
                    input.addEventListener('keyup', _handleInputChange.bind(this));
                    listWrapper.appendChild(input);
                }
            }
            listWrapper.appendChild(list);
            if (!isListWrapperPresent) {
                d.appendChild(listWrapper);
                this.container.appendChild(d);
            }
            // Set focus to search box of multiselect
            if (this.type === 'multi-select' && this.config.searchOption) {
                listWrapper.querySelector('[data-tags-element="input"]').focus();
            }
            this.isListVisible = true;
        }
    }

    function _clearList(isSelectSearch) {
        var list;
        this.isListVisible = false;
        if (this.currentTimerId) {
            clearInterval(this.currentTimerId);
        }
        if (isSelectSearch) {
            list = this.container.querySelector('[data-tags-element="list"]');
        }
        else {
            list = this.container.querySelector('[data-tags-element="multiselect-wrapper"]');
        }
        if (list) {
            list.parentElement.removeChild(list);
        }
        if (this.type === 'autocomplete' && this.config.fromServer) {
            this.data = [];
        }
        this.highlightPosition = -1;
    }

    function _handleInputChange(e) {
        var current, currentValue, currentKey, prevValue, isTextSame, itemSelectedClass, $selectedItems;
        current = e.currentTarget;
        currentValue = current.value || '';
        currentValue = currentValue.trim().toLowerCase();
        currentKey = e.keyCode || e.which;
        prevValue = this.prevText;
        isTextSame = currentValue === prevValue;
        this.prevText = currentValue;
        if (!isTextSame) {
            this._setLoading(false);
            if (this.type === 'autocomplete') {
                this._clearList();
                this.currentTimerId = null;
                if (currentValue.length >= this.config.minCharacters) {
                    if (!this.isListPopulated || this.config.fromServer) {
                        this._populateList();
                    } else if (!this.config.fromServer) {
                        this._render(true);
                    }
                }
            } else if (this.type === 'single-select' || this.type === 'multi-select') {
                if (this.type === 'single-select' && !this.prevText) {
                    if (this.selectedItems && this.selectedItems[0]) {
                        this._removeElement(this.selectedItems[0].key);
                    }
                }
                if (this.config.searchOption) {
                    this._searchList();
                }
            }
        } else if (keyMap[currentKey]) {
            this._handleKeyPress(keyMap[currentKey]);
        }
    }

    function _searchList() {
        // Pass isSearching parameter as true to retain the search input in case of select dropdowns
        this._clearList(true);
        // Pass isFilter true to local search for data in case of select list
        this._render(true);
    }

    function _handleMouseClick(e) {
        this._selectElement();
    }

    function _handleKeyPress(key) {
        switch (key) {
            case 'ESCAPE':
                this._handleEscape();
                break;
            case 'ENTER':
                this._handleEnter();
                break;
            case 'UP_ARROW':
                this._handleUpArrow();
                break;
            case 'DOWN_ARROW':
                this._handleDownArrow();
                break;
        }

    }

    function _handleEscape() {
        // Close the list on Escape key press
        this._clearList();
    }

    function _handleEnter() {
        if (this.highlightPosition == -1) {
            if (this.type === 'autocomplete' && !this.isListVisible) {
                if (!this.isListPopulated || this.config.fromServer) {
                    this._populateList();
                } else if (!this.config.fromServer) {
                    this._render(true);
                }
            }
        } else {
            this._selectElement();
        }
    }

    function _handleUpArrow() {
        var $listOptions;
        if (this.isListVisible) {
            $listOptions = this.container.querySelectorAll('[data-tags-element="option"]');
            if (this.highlightPosition <= 0) {
                this.highlightPosition = $listOptions.length - 1;
            } else {
                this.highlightPosition -= 1;
            }
            // Pass isKeyPressed as true
            this._hightlightElement(true);
        }
    }

    function _handleDownArrow() {
        var $listOptions;
        if (this.isListVisible) {
            $listOptions = this.container.querySelectorAll('[data-tags-element="option"]');
            if (this.highlightPosition < $listOptions.length - 1) {
                this.highlightPosition += 1;
            } else {
                this.highlightPosition = 0;
            }
            // Pass isKeyPressed as true
            this._hightlightElement(true);
        }
    }

    function _handleMouseOver(e) {
        var current, index;
        current = e.currentTarget;
        index = current.dataset.index;
        this.highlightPosition = index;
        this._hightlightElement();
    }

    function _handleMouseOut(e) {
        var current;
        current = e.currentTarget;
        this.highlightPosition = -1;
        this._hightlightElement();
    }

    function _handleOutsideClick(e) {
        var target, $list;
        target = e.target;
        if (this.container) {
            $list = this.container.querySelector('[data-tags-element="list"]');
            if ($list) {
                if (!this.container.contains(target)) {
                    this._clearList();
                }
            }
        }
    }

    function _handleBlurEvent(e) {
        this._clearInput();
    }

    function _handleInputFocus(e) {
        var maxTags;
        if (this.disabled) {
            return;
        }
        maxTags = this.config.maxTags;
        if (!this.isListVisible) {
            if ((maxTags > 0 && this.selectedItems.length < maxTags) || maxTags === -1 || this.type === 'single-select') {
                if (!this.isListPopulated)
                    this._populateList();
                else {
                    this._render();
                }
            }
        } else {
            this._clearList();
        }
    }

    function _handleMultiSelectFocus(e) {
        var target, data_element;
        target = e.target;
        data_element = target.dataset.tagsElement;
        if (!data_element || (data_element !== 'selected-item' && data_element !== 'remove-item')) {
            _handleInputFocus.call(this, e);
        }
    }

    function _clearInput() {
        var $input;
        $input = this.container.querySelector('[data-tags-element="input"]');
        if ($input) { // Clear input if no item is selected
            if (this.type !== 'single-select' || this.selectedItems.length < 1) {
                $input.value = '';
                this.prevText = '';
            } else { // Set textbox value to the item selected
                $input.value = this.selectedItems[0].value;
                this.prevText = this.selectedItems[0].value.trim().toLowerCase();
            }
        }
    }

    function _hightlightElement(isKeyPressed) {
        var $listElement, classes, highlightedClass, highlightedClassSelector, $listItems, $prevSelectedItem, $selectedItem;
        $listElement = this.container.querySelector('[data-tags-element="list"]');
        classes = this.config.classes;
        highlightedClass = classes.optionHighlight;
        highlightedClassSelector = '.' + highlightedClass;
        $listItems = $listElement.children;
        $prevSelectedItem = $listElement.querySelector(highlightedClassSelector);
        if ($prevSelectedItem) {
            $prevSelectedItem.classList.remove(highlightedClass);
        }
        $selectedItem = $listItems[this.highlightPosition];
        if ($selectedItem) {
            $selectedItem.classList.add(highlightedClass);
            if (isKeyPressed) { // Scroll the list if the item is not visible
                $listElement.scrollTop = $selectedItem.offsetTop - $listElement.clientHeight + $selectedItem.clientHeight;
            }
        }
    }

    function _selectElement() {
        var classes, optionSelectedClass, optionSelectedClassSelector, $listElement, $listItems, $selectedItem, value, key, items, selectedItem, $allSelectedOptions, isItemAlreadySelected;
        if (this.disabled) {
            return;
        }
        classes = this.config.classes;
        optionSelectedClass = classes.optionSelected;
        optionSelectedClassSelector = '.' + optionSelectedClass;
        $listElement = this.container.querySelector('[data-tags-element="list"]');
        $listItems = $listElement.children;
        $selectedItem = $listItems[this.highlightPosition];
        value, key;
        items = this.selectedItems;
        if ($selectedItem) {
            value = $selectedItem.dataset.value;
            key = $selectedItem.dataset.key;
            selectedItem = {
                key: key,
                value: value
            };
            isItemAlreadySelected = _isItemPresentInList(selectedItem, this.selectedItems, 'key', 'key');
            if (isItemAlreadySelected) {
                return;
            }
            $allSelectedOptions = $listElement.querySelectorAll('[data-key="' + key + '"]');
            if ($allSelectedOptions) {
                Array.prototype.slice.call($allSelectedOptions)
                    .forEach(function (item) {
                        item.classList.add(optionSelectedClass);
                    });
            }
            if (this.type === 'single-select') {
                this.selectedItems = [];
            }
            this._pushItem(selectedItem);
        }
    }

    function _pushItem(selectedItem) {
        var items, $input, $spanWrapper, $span, $remove, $wrapper, $displayHolder, fn;
        items = this.selectedItems;
        if (this.config.maxTags > 0 && items.length === this.config.maxTags) {
            console.error('Items exceed than maximum allowed items');
            return false;
        }
        $input = this.container.querySelector('[data-tags-element="input"]');
        if (!_isItemPresentInList(selectedItem, items, 'key', 'key')) {
            items.push(selectedItem);
            if (getTypeOf(this.config.onItemSelect) === 'Function') {
                fn = this.config.onItemSelect;
                _callCallback.call(this, fn);
            }
            if (this.type !== 'single-select') {
                if (this.type === 'multi-select') {
                    $displayHolder = this.container.querySelector("[data-tags-element='display-holder']");
                    if ($displayHolder) {
                        $displayHolder.parentElement.removeChild($displayHolder);
                    }
                }
                $spanWrapper = this._getTemplate('selectedItemWrapper');
                $span = this._getTemplate('selectedItem', selectedItem.key, selectedItem.value);
                $remove = this._getTemplate('removeIcon');
                $spanWrapper.appendChild($span);
                $spanWrapper.appendChild($remove);
                $remove.addEventListener('click', _handleRemoveElement.bind(this));
                $wrapper = this.container.querySelector('[data-tags-element="item-wrapper"]');
                $input = $wrapper.querySelector('[data-tags-element="input"]');
                if ($input) {
                    $wrapper.insertBefore($spanWrapper, $input);
                } else {
                    $wrapper.appendChild($spanWrapper);
                }
            }
        }
        if (this.config.maxTags > 0 && items.length === this.config.maxTags) {
            this._clearList();
            if (this.type !== 'single-select') {
                this._clearInput();
                this._removeInput();
            }
            if (this.type === 'single-select') {
                $input.value = items[0].value;
                this.prevText = items[0].value.trim().toLowerCase();
            }
        }
        return true;
    }

    function _removeInput() {
        var $input;
        $input = this.container.querySelector('[data-tags-element="input"]');
        if ($input) {
            $input.parentElement.removeChild($input);
        }
    }

    function _handleRemoveElement(e) {
        var element, key;
        element = e.currentTarget.parentElement.querySelector('[data-tags-element="selected-item"]');
        key = element.dataset.key;
        this._removeElement(key);
    }

    function _removeElement(key) {
        var $selectedItems, i, j, $item, $itemWrapper, index, $el, item, fn;
        if (this.disabled) {
            return;
        }
        if (getTypeOf(this.config.onItemRemove) === 'Function') {
            fn = this.config.onItemRemove;
            _callCallback.call(this, fn);
        }
        index = -1;
        i = 0;
        for (; i < this.selectedItems.length; i++) {
            item = this.selectedItems[i];
            if (item.key === key) {
                index = i;
                break;
            }
        }
        if (index !== -1) {
            this.selectedItems.splice(index, 1);
        }

        $selectedItems = this.container.querySelectorAll('[data-tags-element="selected-item"]');
        if ($selectedItems) {
            j = 0;
            $item;
            for (; j < $selectedItems.length; j++) {
                $el = $selectedItems[j];
                if ($el.dataset.key === key) {
                    $item = $el;
                    break;
                }
            }
            if ($item) {
                $itemWrapper = $item.parentElement;
                $itemWrapper.parentElement.removeChild($itemWrapper);
                if (this.type !== 'multi-select' && this.config.maxTags > 0 && this.selectedItems.length < this.config.maxTags && !this.container.querySelector('[data-tags-element="input"]')) {
                    this._createInput();
                }
                else if (this.type === 'multi-select' && this.selectedItems.length === 0) {
                    this._createInput();
                }
            }
        }
    }

    function _isItemPresentInList(item, list, keyForItem, keyForList) {
        var index, element;
        if (list) {
            index = 0;
            for (; index < list.length; index++) {
                element = list[index];
                if (item[keyForItem] === element[keyForList]) {
                    return true;
                }
            }
        }
        return false;
    }

    function _getWidth(el) {
        var styles, margin;
        styles = window.getComputedStyle(el);
        margin = parseFloat(styles['margin-right']) + parseFloat(styles["margin-left"]);
        return Math.ceil(el.offsetWidth + margin);
    }

    function _createInput() {
        var container, wrapper, placeholder, input, displayHolder, type, isInit, caret;
        type = this.type;
        caret = this._getTemplate('caretSign');
        if (!this.container) { // If list is initialized for the first time
            container = this._getTemplate('container');
            wrapper = this._getTemplate('wrapper');
            isInit = true;
            this.container = container;
        } else {
            isInit = false;
            wrapper = this.container.querySelector('[data-tags-element="item-wrapper"]');
        }
        placeholder = this.type === 'autocomplete' ? this.config.placeholderSearch : this.config.placeholder;
        if (this.type !== 'multi-select') {
            input = this._getTemplate('input', placeholder);
            wrapper.appendChild(input);
            input.addEventListener('keyup', _handleInputChange.bind(this));
            input.addEventListener('blur', _handleBlurEvent.bind(this));
            if (this.type === 'single-select') {
                input.addEventListener('focus', _handleInputFocus.bind(this));
                caret.addEventListener('click', function () {
                    input.focus();
                });
                this.container.appendChild(caret);
            }
        } else {
            displayHolder = this._getTemplate('selectDisplay');
            if (isInit) {
                wrapper.addEventListener('click', _handleMultiSelectFocus.bind(this));
            }
            wrapper.appendChild(displayHolder);
            wrapper.appendChild(caret);
        }
        this.container.appendChild(wrapper);
        if (isInit) {
            this.container.appendChild(this._getTemplate('loading', this.config.loadingText));
        }
        this.element.appendChild(this.container);
    }

    function _populateList() {
        var wait, val, timer, promiseToResolve, fromServer;
        wait = 0;
        fromServer = this.config.fromServer;
        val = this.prevText;
        if (fromServer && this.type === 'autocomplete') {
            // Set wait as debounce if request is needed to be sent to server.
            // Request is sent to server for the autocomplete only.
            wait = this.config.debounce;
        }
        if (getTypeOf(this.config.choices) === 'Array' && !fromServer) {
            // If the choices is an Array set it as data. This is ignored if fromServer is set to true
            this.data = this.config.choices;
            this.isListPopulated = true;
            this._render(true);
        } else if (getTypeOf(this.config.choices) === 'Function') {
            // If the choices are coming from a Promise, then resolve the promise and set it as data.
            // Call goes here everytime is type is autocomplete and fromServer is true to populate list on input change.
            // In case of select, call goes only once, for the first time to populate list.
            this.currentTimerId = setTimeout(function _populateListTimeout() {
                if (this.currentTimerId) {
                    this._setLoading(true);
                }
                promiseToResolve = this.config.choices(val);
                promiseToResolve
                    .then(function (data) {
                        if (timer === this.currentTimerId) {
                            this.data = data;
                            this.isListPopulated = true;
                            this._render(!fromServer || this.type !== 'autocomplete');
                            this._setLoading(false);
                        }
                    }.bind(this)).catch(function (error) {
                        console.error(error);
                    });
            }.bind(this), wait);
            timer = this.currentTimerId;
        }
    }

    function getValues(isWholeObjectRequested) {
        var returnArray;
        if (isWholeObjectRequested) {
            return this.selectedItems;
        } else {
            returnArray = [];
            this.selectedItems.forEach(function (item) {
                returnArray.push(item.value);
            });
            return returnArray;
        }
    }

    function setEnabled(isEnabled) {
        var $caret, $removeIconsCollection, $input, disabledText, enabledPlaceholderText, $selectedItemsWrappers;
        this.disabled = !isEnabled;
        disabledText = !!!isEnabled ? 'true' : 'false';
        this.element.setAttribute('data-tags-disabled', disabledText);
        $caret = this.container.querySelector('[data-tags-element="caret"]');
        if ($caret) {
            $caret.setAttribute('data-tags-disabled', disabledText);
        }
        $selectedItemsWrappers = this.container.querySelectorAll('[data-tags-element="selected-item-wrapper"]');
        if ($selectedItemsWrappers) {
            Array.prototype.slice.call($selectedItemsWrappers)
                .forEach(function (item) {
                    item.setAttribute('data-tags-disabled', disabledText);
                });
        }
        $removeIconsCollection = this.container.querySelectorAll('[data-tags-element="remove-item"]');
        if ($removeIconsCollection) {
            Array.prototype.slice.call($removeIconsCollection)
                .forEach(function (item) {
                    item.setAttribute('data-tags-disabled', disabledText);
                });
        }
        $input = this.container.querySelector('[data-tags-element="input"]');
        if ($input) {
            $input.setAttribute('data-tags-disabled', disabledText);
            $input.disabled = !!!isEnabled;
            if (this.type === 'autocomplete') {
                enabledPlaceholderText = this.config.placeholderSearch;
            } else {
                enabledPlaceholderText = this.config.placeholder;
            }
            $input.placeholder = !!!isEnabled ? '' : enabledPlaceholderText;
        }
    }

    function _callCallback(fn) {
        fn.apply(this, Array.prototype.slice.call(arguments));
    }

    function _setLoading(isLoading) {
        var $loading;
        $loading = this.container.querySelector('[data-tags-element="loading"]');
        if ($loading) {
            if (isLoading) {
                $loading.style.display = '';
            } else {
                $loading.style.display = 'none';
            }
        }
    }

    function init() {
        var items, key, value, typeofChoices, validTypes, fn;
        validTypes = ['autocomplete', 'single-select', 'multi-select'];
        if (!this.type || validTypes.indexOf(this.type) === -1) {
            console.error('Please Enter Valid Type In Element');
            return;
        }

        typeofChoices = getTypeOf(this.config.choices);
        if (typeofChoices !== 'Function' && typeofChoices !== 'Array') {
            console.error('Please give choices: Promise or List');
            return;
        }

        // if fromServer is true and type is autocomplete, then type of choices must be a promise
        if (this.config.fromServer && typeofChoices !== 'Function' && this.type === 'autocomplete') {
            console.error('Choices must be a promise when fromserver is true');
        }

        if (this.type === 'single-select') {
            this.config.maxTags = 1;
        }

        this._createTemplates();
        this._createInput();

        document.addEventListener('click', _handleOutsideClick.bind(this));

        items = this.config.items;
        if (getTypeOf(items) !== 'Array') {
            console.error('Items should be an array of objects');
            return;
        }
        items.some(function (item) {
            key = item[this.config.key];
            value = item[this.config.value];
            return !this._pushItem({ key: key, value: value });
        }.bind(this));

        allInitializedElements[tagsIdentityCount++] = this;

        if (getTypeOf(this.config.onInit) === 'Function') {
            fn = this.config.onInit;
            _callCallback.call(this, fn);
        }

        return this;
    }

    return TagsInput;
});