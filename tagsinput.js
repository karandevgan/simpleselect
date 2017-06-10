(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define([], factory);
    } else if (typeof module === 'object' && module.exports) {
        module.exports = factory();
    } else {
        root.TagsInput = factory();
    }
})(this, function () {
    'use strict';
    var allInitializedElements, keyMap, defaultOptions, extend, strToEl, tagsIdentityCount;
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
        closeOnBlur: true,
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
            multiselectInput: 'tags-input__input--multi'
        },
        key: 'key',
        value: 'value'
    };

    extend = function (obj1, obj2) {
        var returnObject, prop, i;
        if (Object.extend) {
            return Object.assign({}, obj1, obj2);
        }
        returnObject = {};
        if (typeof obj1 === 'object' && typeof obj2 === 'object') {
            i = 0;
            for (prop in obj1) {
                obj1.hasOwnProperty(prop);
                returnObject[prop] = obj1[prop];
            }
            for (prop in obj2) {
                obj2.hasOwnProperty(prop);
                returnObject[prop] = obj2[prop];
            }
        }
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
        var elements, i, e1, e0;
        if (typeof element === 'string') {
            elements = document.querySelectorAll(element);
            if (elements.length > 1) {
                i = 1;
                for (; i < elements.length; i++) {
                    e1 = elements[i];
                    new TagsInput(e1, userOptions);
                }
            }
            e0 = elements[0];
        } else {
            e0 = element;
        }
        if (e0 && e0.dataset.tagsId) {
            return allInitializedElements[e0.dataset.tagsId];
        }
        e0.dataset.tagsId = tagsIdentityCount;
        userOptions = userOptions || {};
        this.highlightPosition = -1;
        this.config = extend(defaultOptions, userOptions);
        this.element = typeof element === 'string' ? document.querySelector(element) : element;
        this.type = element.dataset.type;
        this.isListVisible = false;
        this.prevText = '';
        this.selectedItems = [];
        this.data = [];
        this.currentTimerId = null;
        this.init();
    }

    TagsInput.prototype.init = init;
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
    TagsInput.prototype.getValues = getValues;

    function _createTemplates() {
        var classes = this.config.classes;
        this.config.templates = {
            container: function () {
                return strToEl('<div class="%CONTAINER_CLASS%"></div>'
                    .replace('%CONTAINER_CLASS%', classes.container));
            },
            wrapper: function () {
                return strToEl('<div class="%WRAPPER_CLASS%" data-element="item-wrapper"></div>'
                    .replace('%WRAPPER_CLASS%', classes.wrapper));
            },
            selectDisplay: function () {
                return strToEl('<div class="%SINGLE_SELECT_ITEM_CLASS%" data-element="display-holder">%PLACEHOLDER%</div>'
                    .replace('%SINGLE_SELECT_ITEM_CLASS%', classes.selectDisplay)
                    .replace('%PLACEHOLDER%', this.config.placeholder));
            },
            input: function (placeholder, inputClass) {
                inputClass = inputClass || classes.input;
                return strToEl('<input class="%INPUT_CLASS%" data-element="input" placeholder="%PLACEHOLDER%" />'
                    .replace('%INPUT_CLASS%', inputClass)
                    .replace('%PLACEHOLDER%', placeholder));
            },
            list: function () {
                return strToEl('<ul class="%LIST_CLASS%" data-element="list"></ul>'
                    .replace('%LIST_CLASS%', classes.list));
            },
            listItem: function (index, key, value) {
                return strToEl('<li class="%OPTION_CLASS%" data-element="option" data-index="%INDEX%" data-key="%KEY%" data-value="%VALUE%">%VALUE%</li>'
                    .replace('%OPTION_CLASS%', classes.option)
                    .replace('%INDEX%', index)
                    .replace('%KEY%', key)
                    .replace(/%VALUE%/g, value));
            },
            listWrapper: function () {
                return strToEl('<div class="%MULTI_WRAPPER_CLASS%" data-element="multiselect-wrapper"></div>'
                    .replace('%MULTI_WRAPPER_CLASS%', classes.listWrapper))
            },
            selectedItemWrapper: function () {
                return strToEl('<span class="%ITEM_WRAPPER_CLASS%"></span>'.replace('%ITEM_WRAPPER_CLASS%', classes.itemWrapper));
            },
            selectedItem: function (key, value) {
                return strToEl('<span class="%ITEM_CLASS%" data-key="%KEY%" data-element="selected-item">%VALUE%</span>'
                    .replace('%ITEM_CLASS%', classes.selectedItem)
                    .replace(/%KEY%/g, key)
                    .replace(/%VALUE%/g, value));
            },
            removeIcon: function () {
                return strToEl('<span class="%REMOVE_ITEM_CLASS%" data-element="remove-item">X</span>'
                    .replace('%REMOVE_ITEM_CLASS%', classes.removeIcon));
            }
        };
    }

    function _getTemplate(template) {
        var args, templates;
        args = Array.prototype.slice.call(arguments, 1);
        if (!template) return;
        templates = this.config.templates;
        return templates[template].apply(this, args);
    }

    function _render(isFilter) {
        var data, list, keyAttr, valAttr, itemEl, isListWrapperPresent, d, listWrapper, input;

        list = this._getTemplate('list');
        keyAttr = this.config.key;
        valAttr = this.config.value;

        if (isFilter) {
            data = this.data.filter(function (item) {
                return item[valAttr].toString().toLowerCase().indexOf(this.prevText) !== -1;
            }.bind(this));
        } else {
            data = this.data;
        }
        if (data && data.length) {
            data.forEach(function (item, index) {
                if (typeof item[keyAttr] === 'string' && typeof item[valAttr] === 'string') {
                    itemEl = this._getTemplate('listItem', index, item[keyAttr], item[valAttr]);
                    if (_isItemPresentInList(item, this.selectedItems, 'key')) {
                        itemEl.classList.add(this.config.classes.optionSelected);
                    }
                    itemEl.addEventListener('mouseover', _handleMouseOver.bind(this));
                    itemEl.addEventListener('mouseout', _handleMouseOut.bind(this));
                    itemEl.addEventListener('click', _handleMouseClick.bind(this));
                    list.appendChild(itemEl);
                }
            }.bind(this));
            isListWrapperPresent = true;
            d = document.createDocumentFragment();
            listWrapper = this.container.querySelector('[data-element="multiselect-wrapper"]');
            if (!listWrapper) {
                listWrapper = this._getTemplate('listWrapper');
                isListWrapperPresent = false;
            }
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
            if (this.type === 'multi-select' && this.config.searchOption) {
                listWrapper.querySelector('[data-element="input"]').focus();
            }
            this.isListVisible = true;
        }
    }

    function _clearList(isMultiSearch) {
        var list;
        this.isListVisible = false;
        if (this.currentTimerId) {
            clearInterval(this.currentTimerId);
        }
        if (isMultiSearch) {
            list = this.container.querySelector('[data-element="list"]');
        }
        else {
            list = this.container.querySelector('[data-element="multiselect-wrapper"]');
        }
        if (list) {
            list.parentElement.removeChild(list);
        }
        if (this.type === 'text') {
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
            if (this.type === 'text') {
                this._clearList();
                if (currentValue.length >= this.config.minCharacters) {
                    this._populateList();
                }
            } else if (this.type === 'single-select' || this.type === 'multi-select') {
                if (this.type === 'single-select' && !this.prevText) {
                    itemSelectedClass = this.config.classes.optionSelected;
                    this.selectedItems = [];
                    $selectedItems = this.container.querySelectorAll('.' + itemSelectedClass);
                    if ($selectedItems) {
                        var i = 0;
                        for (; i < $selectedItems.length; i++) {
                            $selectedItems[i].classList.remove(itemSelectedClass);
                        }
                    }
                }
                if (this.config.searchOption) {
                    this._searchList();
                }
            }
        } else if (this.isListVisible && keyMap[currentKey]) {
            this._handleKeyPress(keyMap[currentKey]);
        }
    }

    function _searchList() {
        this._clearList(true);
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
        this._clearList();
    }

    function _handleEnter() {
        if (this.highlightPosition == -1) {
            if (this.type === 'text') {
                this._clearList();
                this._populateList();
            }
        } else {
            this._selectElement();
        }
    }

    function _handleUpArrow() {
        var $listOptions;
        if (this.isListVisible) {
            $listOptions = this.container.querySelectorAll('[data-element="option"]');
            if (this.highlightPosition <= 0) {
                this.highlightPosition = $listOptions.length - 1;
            } else {
                this.highlightPosition -= 1;
            }
            this._hightlightElement(true);
        }
    }

    function _handleDownArrow() {
        var $listOptions;
        if (this.isListVisible) {
            $listOptions = this.container.querySelectorAll('[data-element="option"]');
            if (this.highlightPosition < $listOptions.length - 1) {
                this.highlightPosition += 1;
            } else {
                this.highlightPosition = 0;
            }
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
            $list = this.container.querySelector('[data-element="list"]');
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
        if (!this.isListVisible) {
            if ((this.config.maxTags > 0 && this.selectedItems.length < this.config.maxTags) || this.maxTags === -1 || this.type === 'single-select') {
                this._populateList();
            }
        }
    }

    function _handleMultiSelectFocus(e) {
        var target, data_element;
        target = e.target;
        data_element = target.dataset.element;
        if (data_element && (data_element === 'item-wrapper' || data_element === 'display-holder')) {
            _handleInputFocus.call(this, e);
        }
    }

    function _clearInput() {
        var $input;
        $input = this.container.querySelector('[data-element="input"]');
        if ($input) {
            if (this.type !== 'single-select' || this.selectedItems.length < 1) {
                $input.value = '';
                this.prevText = '';
            } else {
                $input.value = this.selectedItems[0].value;
                this.prevText = this.selectedItems[0].value.trim().toLowerCase();
            }
        }
    }

    function _hightlightElement(isKeyPressed) {
        var $listElement, classes, highlightedClass, highlightedClassSelector, $listItems, $prevSelectedItem, $selectedItem;
        $listElement = this.container.querySelector('[data-element="list"]');
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
            if (isKeyPressed) {
                $listElement.scrollTop = $selectedItem.offsetTop - $listElement.clientHeight + $selectedItem.clientHeight;
            }
        }
    }

    function _selectElement() {
        var classes, optionSelectedClass, optionSelectedClassSelector, $listElement, $listItems, $selectedItem, value, key, items, selectedItem, $allSelectedOptions;
        classes = this.config.classes;
        optionSelectedClass = classes.optionSelected;
        optionSelectedClassSelector = '.' + optionSelectedClass;
        $listElement = this.container.querySelector('[data-element="list"]');
        $listItems = $listElement.children;
        $selectedItem = $listItems[this.highlightPosition];
        value, key;
        items = this.selectedItems;
        if ($selectedItem) {
            value = $selectedItem.dataset.value;
            key = $selectedItem.dataset.key;
            $allSelectedOptions = $listElement.querySelectorAll('[data-key="' + key + '"]');
            if ($allSelectedOptions) {
                var i = 0;
                for (; i < $allSelectedOptions.length; i++) {
                    $allSelectedOptions[i].classList.add(optionSelectedClass);
                }
            }
        }
        selectedItem = {
            key: key,
            value: value
        };
        if (this.type === 'single-select') {
            this.selectedItems = [];
        }
        this._pushItem(selectedItem);
    }

    function _pushItem(selectedItem) {
        var items, $input, $spanWrapper, $span, $remove, $wrapper, $displayHolder;
        items = this.selectedItems;
        if (this.config.maxTags > 0 && items.length === this.config.maxTags) {
            console.error('Items exceed than maximum allowed items');
            return false;
        }
        $input = this.container.querySelector('[data-element="input"]');
        if (!_isItemPresentInList(selectedItem, items, 'key')) {
            items.push(selectedItem);
            if (this.type !== 'single-select') {
                if (this.type === 'multi-select') {
                    $displayHolder = this.container.querySelector("[data-element='display-holder']");
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
                $wrapper = this.container.querySelector('[data-element="item-wrapper"]');
                $input = $wrapper.querySelector('[data-element="input"]');
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
        $input = this.container.querySelector('[data-element="input"]');
        if ($input) {
            $input.parentElement.removeChild($input);
        }
    }

    function _handleRemoveElement(e) {
        var element, key;
        element = e.currentTarget.parentElement.querySelector('[data-element="selected-item"]');
        key = element.dataset.key;
        this._removeElement(key);
    }

    function _removeElement(key) {
        var $selectedItems, i, j, $item, $itemWrapper, index, $el, item;
        $selectedItems = this.container.querySelectorAll('[data-element="selected-item"]');
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
                if (this.type !== 'multi-select' && this.config.maxTags > 0 && this.selectedItems.length < this.config.maxTags && !this.container.querySelector('[data-element="input"]')) {
                    this._createInput();
                }
                else if (this.type === 'multi-select' && this.selectedItems.length === 0) {
                    this._createInput();
                }
            }
        }
    }

    function _isItemPresentInList(item, list, key) {
        var index, element;
        if (list) {
            index = 0;
            for (; index < list.length; index++) {
                element = list[index];
                if (element[key] === item[key]) {
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
        var container, wrapper, placeholder, input, displayHolder, type, isNewDisplayWrapper;
        type = this.type;
        if (!this.container) {
            container = this._getTemplate('container');
            wrapper = this._getTemplate('wrapper');
            isNewDisplayWrapper = true;
            this.container = container;
        } else {
            isNewDisplayWrapper = false;
            wrapper = this.container.children[0];
        }
        placeholder = this.type === 'text' ? this.config.placeholderSearch : this.config.placeholder;
        if (this.type !== 'multi-select') {
            input = this._getTemplate('input', placeholder);
            input.addEventListener('keyup', _handleInputChange.bind(this));
            input.addEventListener('blur', _handleBlurEvent.bind(this));
            if (this.type === 'single-select') {
                input.addEventListener('focus', _handleInputFocus.bind(this));
            }
            wrapper.appendChild(input);
        } else {
            displayHolder = this._getTemplate('selectDisplay');
            if (isNewDisplayWrapper) {
                wrapper.addEventListener('click', _handleMultiSelectFocus.bind(this));
            }
            wrapper.appendChild(displayHolder);
        }
        this.container.appendChild(wrapper);
        this.element.appendChild(this.container);
    }

    function _populateList() {
        var wait, val, timer, promiseToResolve;
        wait = 0;
        if (this.type === 'text') {
            wait = this.config.debounce;
        }
        val = this.prevText;
        this.currentTimerId = setTimeout(function _populateListTimeout() {
            if (typeof this.config.choices === 'object') {
                this.data = this.config.choices;
                this._render();
            } else if (typeof this.config.choices === 'function') {
                promiseToResolve = this.config.choices(val);
                promiseToResolve
                    .then(function (data) {
                        if (timer === this.currentTimerId) {
                            this.data = data;
                            this._render();
                        }
                    }.bind(this)).catch(function (error) {
                        console.error(error);
                    });
            }
        }.bind(this), wait);
        timer = this.currentTimerId;
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

    function init() {
        var items, key, value;
        if (!this.type) {
            console.error('Please Enter Type In Element');
            return;
        }

        if (typeof this.config.choices !== 'function' && typeof this.config.choices !== 'object') {
            console.error('Please give choices: Promise or List');
            return;
        }

        if (this.type === 'single-select') {
            this.config.maxTags = 1;
        }

        this._createTemplates();
        this._createInput();

        document.addEventListener('click', _handleOutsideClick.bind(this));

        items = this.config.items;
        if (items && items.length > 0) {
            items.some(function (item) {
                key = item[this.config.key];
                value = item[this.config.value];
                return !this._pushItem({ key: key, value: value });
            }.bind(this));
        }
        allInitializedElements[tagsIdentityCount++] = this;
        return this;
    }

    return TagsInput;
});