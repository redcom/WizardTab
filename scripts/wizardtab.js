(function($){ // jQuery shield
    jQuery.fn.wizardtab = function(options){
        var _self = this;
        
        var _tabsHead = []; // this contains the tabs headers
        var _tabsBody = []; // this contains the bodies of the tab
        options = options || {}; // define the options object in case the plugin is initiated in self sustained mode
        // default option will be used.
        
        
        /* ===== DEFAULT VALUES CAN BE CHANGED ======== */
        _self.showTab = options.showTab || 1; // use tabs starting from 1 as the first element
        _self.tabsVisible = options.tabsVisible || 6; // number of tabs to be visible if there are tabs that wont fit in the width visible area
        _self.scrollTabsBy = options.scrollTabsBy || 1; // this is the number of tabs to scroll with.
        _self.isWizardMode = options.isWizard || true; // start the plugin in wizardMode
        _self.onFinish = options.onFinish || null; // function to call on last tab is triggered
        _self.onTabChange = options.onTabChange || null; // function to call when tab was changed
        _self.onTabFirst = options.onTabFirst || null; // function to call when first tab was triggered 
        _self.onTabLast = options.onTabLast || null; // function to call when last tab is triggered
        _self.classTabHeads = options.classTabHeads || "tabHeads";
        
        // option to enable passed tabs when pressed next.
        _self.allowPreviousWhenPassedFlag = options.allowPreviousWhenPassed || true;
        
        // invalidate hide/disable invalid buttons
        _self.hideInvalidNextButtonFlag = options.hideInvalidNextButton || true;
        _self.disableInvalidNextButtonFlag = options.disableInvalidNextButton || false;
        
        _self.hideInvalidPrevButtonFlag = options.hideInvalidPreviousButton || true;
        _self.disableInvalidPrevButtonFlag = options.disableInvalidPreviousButton || false;
        
        _self.hideInvalidFinishButtonFlag = options.hideInvalidFinishButton || true;
        _self.disableInvalidFinishButtonFlag = options.disableInvalidFinishButton || false;
        
        // left/right scolling buttons
        _self._btnLeftScrollCls = options.buttonLeftScrollClass || "buttonLeftScroll";
        _self._btnRightScrollCls = options.buttonRightScrollClass || "buttonRightScroll";
        _self.scrollTabsBy = options.scrollTabsBy || 1;
        
        // options for hiding and showing invalid scrolling buttons
        _self.hideInvalidLeftScrollButtonFlag = options.hideInvalidLeftScrollButton || false;
        _self.disableInvalidLeftScrollButtonFlag = options.disableInvalidLeftScrollButton || true;
        _self.hideInvalidRightScrollButtonFlag = options.hideInvalidRightScrollButton || false;
        _self.disableInvalidRightScrollButtonFlag = options.disableInvalidRightScrollButton || true;
        
        // dom id for navigation buttons
        _self.idBtnNext = options.buttonNextId || "buttonNextStep";
        _self.idBtnPrev = options.buttonPreviousId || "buttonPreviousStep";
        _self.idBtnFinish = options.buttonFinishId || "buttonFinishStep";
        
        // capitions for buttons
        _self.buttonNextCaption = options.buttonNextCaption || "Next";
		_self.buttonPreviousCaption = options.buttonPreviousCaption || "Previews";
		_self.buttonFinishCaption = options.buttonFinishCaption || "Finish";
        
        // class that listen for revalidate and trigger the isWizard method
        _self.classRevalidate = options.classRevalidate || "revalidate";
        
        /*============== DO NOT EDIT ANYTHING BELLOW =================== */
        
        
        
        
        
        // internal use and do not modify it.
        _self.showTab = this.showTab - 1; // make it 0 based and work with it internally.
        _self.varStore = {};
        _self._currentTabId = null;
        
        
        // this will initialize the plugin with the default provided options.
        function init(){
            // add caption to buttons
            $("#" + _self.idBtnNext).val(_self.buttonNextCaption);
            $("#" + _self.idBtnPrev).val(_self.buttonPreviousCaption);
            $("#" + _self.idBtnFinish).val(_self.buttonFinishCaption);
            
            // execute onFinish function if it is provided in 
            // the plugin configuration option and if the finish button was clicked
            $("#" + _self.idBtnFinish).click(function(){
                if (_self.onFinish && typeof _self.onFinish === "function") {
                    // postpone the execution of the script when it can be succesfully run.
                    setTimeout(function(){
                        _self.onFinish.call(_self);
                    }, 0);
                }
            });
            // hook onchange event to revalidate class if provided
            if (_self.find("." + _self.classRevalidate).length > 0) {
                _self.find("." + _self.classRevalidate).change(execClassRevalidateFnc);
            }
            if (_self._btnRightScrollCls && _self._btnLeftScrollCls) {
                _self.find("." + _self._btnLeftScrollCls).click(_self.scrollTabsLeft);
                _self.find("." + _self._btnRightScrollCls).click(_self.scrollTabsRight);
            }
        }
        
        // this will change the iswizard mode if the revalidate class is provided
        function execClassRevalidateFnc(){
            if (_self.IsWizard()) {
                // do nothing if we are already in the wizard mode
                _self.IsWizard(true);
                // find the parent of this element, that define container of the tab.
            }
            else {
                // if is not in wizard, only activate the active tab.
                // find the active tab and activate it.
                _self.IsWizard(true);
            }
            var enableTabId = $(this).parents("div[id^='tabs']", 0).attr("id");
            var crtId = 0;
            // find which tabsHeads must be enabled
            for (var i in _tabsHead) {
                if (_tabsHead[i].indexOf(enableTabId) > -1) {
                    crtId = i;
                    break;
                }
            }
            $.each(_tabsHead, function(idx, val){
                if (idx <= crtId) {
                    $("li>a[href='" + val + "']").parent().click(execClickEvent);
                    $("li>a[href='" + val + "']").parent().removeClass("disabled");
                }
            });
        }
        
        // add top tab buttons events for tab wizard
        function setTopTabHeads(){
            _tabsHead = []; // initiate with empty array
            _self.find("ul." + _self.classTabHeads + ">li>a").each(function(index){
            
                _tabsHead.push(($(this).attr("href")));
                // test if we are in wizard mode and prevent click execution on head 
                if (_self.isWizardMode === false) {
                    $(this).parent().click(execClickEvent);
                    $(this).parent().removeClass("disabled");
                }
                else {
                    // remove the click event that was previously attached
                    $(this).parent().unbind("click");
                    $(this).parent().addClass("disabled");
                }
            });
        }
        setTopTabHeads();
        
        
        // hide invisible top tabs buttons 
        function hideTabsHeads(){
        
            var _width = 0;
            var _topTabHeadsWidth = 0;
            if (_self.classTabHeads && $("." + _self.classTabHeads).width() > 0) {
                _topTabHeadsWidth = $("." + _self.classTabHeads).width();
            }
            
            _self.find("ul>li.tabHead").each(function(index){
                // find the widest tab head and based on that position tabs in visible area.
                if ($(this).width() > _width) {
                    _width = $(this).width();
                }
                
            });
            if (_self.tabsVisible) {
                _self.varStore.nrPosibleTabs = _self.tabsVisible;
            }
            else {
                _self.varStore.nrPosibleTabs = Math.floor(_topTabHeadsWidth / _width);
            }
            
            _self.varStore.visibleAreaWidth = _topTabHeadsWidth;
            
            _self.varStore.biggestTab = _width;
            var crtIds = 0;
            _self.find("ul>li.tabHead").each(function(index){
            
                if (crtIds++ < _self.varStore.nrPosibleTabs) {
                    $(this).show();
                }
                else {
                    $(this).hide();
                }
            });
            
        }
        hideTabsHeads();
        // Get the tabs body
        _self.find(">div").each(function(index){
            _tabsBody.push(($(this).attr("id")));
        });
        
        
        // function to execute when the tab header is clicked
        function execClickEvent(showSelected){
        var showId = null;
            if (typeof showSelected === "number") {
                showId = _tabsHead[showSelected];
                hideTabsBody(except = showId);
                if (!$(showId).is(":visible")) {
                    $(showId).show();
                }
                _self._currentTabId = showId;
            }
            else {
                // the the id to show
                showId = $(this).find("a").attr("href");
                
                hideTabsBody(except = showId);
                if (!$(showId).is(":visible")) {
                    $(showId).show();
                }
                _self._currentTabId = showId;
            }
            
            // to add active states
            $('ul.tabHeads li a').each(function(){
                var href = $(this).attr('href');
                if (showId == href) {
                    $(this).parent().siblings().removeClass('active');
                    $(this).parent().addClass('active');
                }
            });
            
            // trigger the tabChange event
            
            if (typeof _self.onTabChange === "function") {
                setTimeout(function(){
                    _self.onTabChange.call(_self, _self._currentTabId, _self);
                }, 0);
            }
            
            if (typeof _self.onTabFirst === "function" && _self._currentTabId === _tabsHead[0]) {
                setTimeout(function(){
                    _self.onTabFirst.call(_self, _self._currentTabId);
                }, 0);
            }
            if (typeof _self.onTabLast === "function" && _self._currentTabId === _tabsHead[_tabsHead.length - 1]) {
                setTimeout(function(){
                    _self.onTabLast.call(_self, _self._currentTabId);
                }, 0);
            }
            if (_self.allowPreviousWhenPassedFlag) {
                setTimeout(function(){
                    if (_self.IsWizard()) {
                        var crtTab = _self.find("ul>li.tabHead>a[href='" + _tabsHead[showSelected] + "']").parent();
                        crtTab.click(execClickEvent);
                        crtTab.removeClass("disabled");
                    }
                }, 0);
            }
            execNavigationOptions();
            return false;
        }
        
        // hide all the tabs body except the one in param
        function hideTabsBody(exception){
            $.each(_tabsHead, function(index, value){
                if (exception === value) {
                    // do nothing
                }
                else {
                    $(value).hide();
                }
            });
        }
        // find the next button and define the function to 
        // be executed when the next button is clicked.
        // if is the last tab, call the function that submits the form
        
        if ($("#" + _self.idBtnNext).length > 0) {
        
            $("#" + _self.idBtnNext).click(function(evt){
            
                var i = 0;
                $.each(_tabsHead, function(index, value){
                    i++;
                    if (_self._currentTabId === value && i < (_tabsHead.length)) {
                        if (i === _tabsHead.length) {
                            if (typeof _self.onFinish === "function") {
                                setTimeout(function(){
                                    _self.onFinish.call(_self);
                                }, 0);
                            }
                            return false;
                        }
                        else {
                            execClickEvent(i); // go to next tab
                            return false;
                            
                        }
                    }
                });
                var _lastTabVisible = (_self.find("ul." + _self.classTabHeads + ">li.tabHead:visible:last").index());
                var _nrInvisibleTabs = _self.find("ul." + _self.classTabHeads + ">li.tabHead:hidden").length;
                if (_self._currentTabId === _tabsHead[_lastTabVisible] && _nrInvisibleTabs > 0) {
                    _self.scrollTabsRight(1);
                }
                var crtTab = _self.find("ul." + _self.classTabHeads + ">li.tabHead>a[href='" + _self._currentTabId + "']").parent();
                var idx = 0;
                var numericCurrentTab = 1 * _self._currentTabId.replace(/\#(.)*\-/, "");
                var numericLastTabVisible = 1 * _tabsHead[_lastTabVisible].replace(/\#(.)*\-/, "");
                
                while (!crtTab.is(":visible") && idx < _tabsHead.length - 1) {
                    if (numericCurrentTab >= numericLastTabVisible) {
                        _self.scrollTabsRight(2);
                    }
                    else {
                        _self.scrollTabsLeft(2);
                    }
                    idx += 2;
                }
                var _firstTabVisible = (_self.find("ul." + _self.classTabHeads + ">li.tabHead:visible:first"));
                
                if (_firstTabVisible.html() == crtTab.html()) {
                    _self.scrollTabsLeft(1);
                }
            });
        }
        // find the prev button and define the function to 
        // be executed when the previews button is clicked.
        // if this is the first tab, stay on the tab
        
        if ($("#" + _self.idBtnPrev).length > 0) {
        
            $("#" + _self.idBtnPrev).click(function(evt){
            
                $.each(_tabsHead, function(index, value){
                    if (_self._currentTabId === value) {
                        var i = index - 1;
                        if (i < 0) {
                            return false;
                        }
                        else {
                            return execClickEvent(i); // go to previews tab
                        }
                    }
                });
                
                var _firstTabVisible = (_self.find("ul." + _self.classTabHeads + ">li.tabHead:visible:first").index());
                
                if (_self._currentTabId === _tabsHead[++_firstTabVisible]) {
                    _self.scrollTabsLeft(1);
                }
                
                var crtTab = _self.find("ul." + _self.classTabHeads + ">li.tabHead>a[href='" + _self._currentTabId + "']").parent();
                var idx = 0;
                var numericCurrentTab = 1 * _self._currentTabId.replace(/\#(.)*\-/, "");
                var numericFirstTabVisible = 1 * _tabsHead[_firstTabVisible].replace(/\#(.)*\-/, "");
                while (!crtTab.is(":visible") && idx < _tabsHead.length - 1) {
                    if (numericCurrentTab >= numericFirstTabVisible) {
                        _self.scrollTabsRight(2);
                    }
                    else {
                        _self.scrollTabsLeft(2);
                    }
                    idx += 2;
                }
            });
        }
        
        // expose IsLast and IsFirst propriety
        _self.IsFirst = function(){
            return _self._currentTabId === _tabsHead[0];
        };
        _self.IsLast = function(){
            return _self._currentTabId === _tabsHead[_tabsHead.length - 1];
        };
        // expose the isWizard mode. if it is true, then the top tab buttons will be disabled
        // if isWizard is false, the top tab buttons are enabled and the the current tab will be the first one
        _self.IsWizard = function(mode){
        
            if (mode === undefined) {
                return _self.isWizardMode;
            }
            if (mode) {
                _self.isWizardMode = true;
                setTopTabHeads();
            }
            else {
                _self.isWizardMode = false;
                setTopTabHeads();
            }
        };
        
        // helper function to hide a button
        function _hideButton(hideFlag, btn2Hide){
            if (btn2Hide) {
                if (hideFlag) { // if set to true then hide it.
                    $("#" + btn2Hide).hide();
                }
                else {
                    $("#" + btn2Hide).show();
                }
            }
            else {
                return false;
            }
        }
        
        // helper function to show a button
        function _showButton(btn2Show){
            if (btn2Show) {
                $("#" + btn2Show).show();
            }
        }
        // helper function to disable a button
        function _disableButton(disableFlag, btn2Disable){
            if (btn2Disable) {
                if (disableFlag) { // if set to true then hide it.
                    $("#" + btn2Disable).attr("disabled", "disabled");
                }
                else {
                    $("#" + btn2Disable).removeAttr("disabled");
                }
            }
            else {
                return false;
            }
        }
        // helper function to enable a button
        function _enableButton(btn2Show){
            if (btn2Show) {
                $("#" + btn2Show).removeAttr("disabled");
            }
        }
        
        //Hides next btn on last tab
        _self.hideInvalidNextButton = function(hide){
        
            if (_self.IsLast()) {
                _hideButton(hide, _self.idBtnNext);
            }
            else {
                _showButton(_self.idBtnNext);
            }
        };
        //Disable next btn on last tab
        _self.disableInvalidNextButton = function(disable){
            if (_self.IsLast()) {
                _disableButton(disable, _self.idBtnNext);
            }
            else {
                _enableButton(_self.idBtnNext);
            }
        };
        
        //Hides previews btn on first tab
        _self.hideInvalidPreviousButton = function(hide){
            if (_self.IsFirst()) {
                _hideButton(hide, _self.idBtnPrev);
            }
            else {
                _showButton(_self.idBtnPrev);
            }
        };
        //Disable next btn on last tab
        _self.disableInvalidPreviousButton = function(disable){
            if (_self.IsFirst()) {
                _disableButton(disable, _self.idBtnPrev);
            }
            else {
                _enableButton(_self.idBtnPrev);
            }
        };
        //Hides finish btn if not in last tab
        _self.hideInvalidFinishButton = function(hide){
            if (!_self.IsLast()) {
                _hideButton(hide, _self.idBtnFinish);
            }
            else {
                _showButton(_self.idBtnFinish);
            }
        };
        //Disable finish btn if not in last tab
        _self.disableInvalidFinishButton = function(disable){
            if (!_self.IsLast()) {
                _disableButton(disable, _self.idBtnFinish);
            }
            else {
                _enableButton(_self.idBtnFinish);
            }
        };
        
        _self.hideNextButton = function(){
            //: export method to hide the next button
            _hideButton(true, _self.idBtnNext);
        };
        _self.showNextButton = function(){
            //: export method to show the next button.
            _showButton(_self.idBtnNext);
        };
        _self.hidePreviousButton = function(){
            //: export method to hide the previous button
            _hideButton(true, _self.idBtnPrev);
        };
        _self.showPreviousButton = function(){
            //: export method to show the previous button
            _showButton(_self.idBtnPrev);
        };
        _self.hideFinishButton = function(){
            //: export method to hide the finish button
            _hideButton(true, _self.idBtnFinish);
        };
        _self.showFinishButton = function(){
            //: export method to show the finish button
            _showButton(_self.idBtnFinish);
        };
        // hide or show invalid scroll left button
        _self.hideInvalidScrollLeftButton = function(flag){
            var _firstTabVisible = _self.find("ul." + _self.classTabHeads + ">li>a[href='" + _tabsHead[0] + "']").parent().is(":visible");
            if (flag) {
                if (_firstTabVisible) {
                    setTimeout(function(){
                        _self.find("." + _self._btnLeftScrollCls).hide();
                    }, 0);
                }
                else {
                    _self.find("." + _self._btnLeftScrollCls).show();
                }
            }
            else {
                _self.find("." + _self._btnLeftScrollCls).show();
            }
        };
        // disable/inable invalid scroll left button
        _self.disableInvalidScrollLeftButton = function(flag){
            var _firstTabVisible = _self.find("ul." + _self.classTabHeads + ">li>a[href='" + _tabsHead[0] + "']").parent().is(":visible");
            if (flag) {
                if (_firstTabVisible) {
                    setTimeout(function(){
                        _self.find("." + _self._btnLeftScrollCls).attr("disabled", "disabled").addClass("disabled");
                    }, 0);
                }
                else {
                    _self.find("." + _self._btnLeftScrollCls).removeAttr("disabled").removeClass("disabled");
                }
            }
            else {
                _self.find("." + _self._btnLeftScrollCls).removeAttr("disabled").removeClass("disabled");
            }
        };
        
        
        // scroll visible tab to left
        _self.scrollTabsRight = function(_navScrollHelper){
        
            var steps = 0;
            var _scrollBy = 0;
            if (_navScrollHelper && _navScrollHelper > 0) {
                _scrollBy = _navScrollHelper;
            }
            else {
                _scrollBy = _self.scrollTabsBy;
            }
            
            while (steps < _scrollBy) {
                stepNr = 0;
                _self.find("ul." + _self.classTabHeads + ">li:visible:first").hide();
                crtIndex = _self.find("ul." + _self.classTabHeads + ">li:visible:first").index();
                _self.find("ul." + _self.classTabHeads + ">li:gt(" + (crtIndex) + ")").each(function(idx){
                
                    if (stepNr < _self.varStore.nrPosibleTabs - 1) {
                        $(this).show();
                    }
                    else {
                        $(this).hide();
                    }
                    stepNr++;
                });
                
                steps++;
            }
            // exec scrollLeft button option settings
            _self.hideInvalidScrollLeftButton(_self.hideInvalidLeftScrollButtonFlag);
            _self.disableInvalidScrollLeftButton(_self.disableInvalidLeftScrollButtonFlag);
            // exec scrollLeft button option settings
            _self.hideInvalidScrollRightButton(_self.hideInvalidRightScrollButtonFlag);
            _self.disableInvalidScrollRightButton(_self.disableInvalidRightScrollButtonFlag);
        };
        
        // scroll visible tab to right
        _self.scrollTabsLeft = function(_navScrollHelper){
            if (_navScrollHelper && _navScrollHelper > 0) {
                _scrollBy = _navScrollHelper;
            }
            else {
                _scrollBy = _self.scrollTabsBy;
            }
            var steps = 0;
            
            while (steps < _scrollBy) {
                var stepNr = 0;
                _firstVisible = _self.find("ul." + _self.classTabHeads + ">li:visible:eq(0)").index();
                
                if (!_self.find("ul." + _self.classTabHeads + ">li:eq(" + (--_firstVisible) + ")").html()) {
                    break;
                    
                }
                _self.find("ul." + _self.classTabHeads + ">li:eq(" + (--_firstVisible) + ")").show();
                
                crtIndex = _self.find("ul." + _self.classTabHeads + ">li:visible:first").index();
                _self.find("ul." + _self.classTabHeads + ">li:gt(" + (crtIndex) + ")").each(function(idx){
                    if (stepNr < _self.varStore.nrPosibleTabs - 1) {
                        $(this).show();
                    }
                    else {
                        $(this).hide();
                    }
                    stepNr++;
                });
                steps++;
                
            }
            
            // exec scrollLeft button option settings
            _self.hideInvalidScrollLeftButton(_self.hideInvalidLeftScrollButtonFlag);
            _self.disableInvalidScrollLeftButton(_self.disableInvalidLeftScrollButtonFlag);
            
            // exec scrollLeft button option settings
            _self.hideInvalidScrollRightButton(_self.hideInvalidRightScrollButtonFlag);
            _self.disableInvalidScrollRightButton(_self.disableInvalidRightScrollButtonFlag);
        };
        // hide/show invalid scroll right button
        _self.hideInvalidScrollRightButton = function(flag){
            var _lastTabVisible = _self.find("ul." + _self.classTabHeads + ">li>a[href='" + _tabsHead[(_tabsHead.length - 1)] + "']").parent().is(":visible");
            if (flag) {
                if (_lastTabVisible) {
                    _self.find("." + _self._btnRightScrollCls).hide();
                }
                else {
                    _self.find("." + _self._btnRightScrollCls).show();
                }
            }
            else {
                _self.find("." + _self._btnRightScrollCls).show();
            }
        };
        // disable/enable invalid scroll right button
        _self.disableInvalidScrollRightButton = function(flag){
            var _lastTabVisible = _self.find("ul." + _self.classTabHeads + ">li>a[href='" + _tabsHead[(_tabsHead.length - 1)] + "']").parent().is(":visible");
            if (flag) {
                if (_lastTabVisible) {
                    _self.find("." + _self._btnRightScrollCls).attr("disabled", "disabled").addClass("disabled");
                }
                else {
                    _self.find("." + _self._btnRightScrollCls).removeAttr("disabled").removeClass("disabled");
                }
            }
            else {
                _self.find("." + _self._btnRightScrollCls).removeAttr("disabled").removeClass("disabled");
            }
        };
        
        // this is the first function that will be called that will initiate the plugin
        // if additional option like hide or disable are sent to the plugin, execute the function
        // for this options.
        function execNavigationOptions(){
            setTimeout(function(){ // wait till the component is ready and then execute extra operation
                // exec next button option settings
                _self.hideInvalidNextButton(_self.hideInvalidNextButtonFlag);
                _self.disableInvalidNextButton(_self.disableInvalidNextButtonFlag);
                // exec prev button option settings
                _self.hideInvalidPreviousButton(_self.hideInvalidNextButtonFlag);
                _self.disableInvalidPreviousButton(_self.disableInvalidNextButtonFlag);
                // exec finish button option settings
                _self.hideInvalidFinishButton(_self.hideInvalidNextButtonFlag);
                _self.disableInvalidFinishButton(_self.disableInvalidNextButtonFlag);
                
                // exec scroll buttons functionality
                if (_self._btnRightScrollCls && _self._btnLeftScrollCls) {
                    // exec scrollLeft button option settings
                    _self.hideInvalidScrollLeftButton(_self.hideInvalidLeftScrollButtonFlag);
                    _self.disableInvalidScrollLeftButton(_self.disableInvalidLeftScrollButtonFlag);
                    
                    // exec scrollLeft button option settings
                    _self.hideInvalidScrollRightButton(_self.hideInvalidRightScrollButtonFlag);
                    _self.disableInvalidScrollRightButton(_self.disableInvalidRightScrollButtonFlag);
                }
            }, 0);
        }
        execNavigationOptions();
        init();
        
        // show default tab if settled and if it is not show the first tab
        // opened
        execClickEvent(_self.showTab);
        return this;
    };
})(jQuery);
