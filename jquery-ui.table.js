/* 
 * Alexey Krylov
 * 
 */
countRows = 0;
jQuery.fn.tableBlock = function(options){
    var options = jQuery.extend({
        width:'auto',
        height:'auto',
        showRowsOnPage: true,
        showButton: true,
        showRowsSelected: true,
        showListing: true,
        JSONHead: {},
        JSONData: {},
        labelRowsOnPage:'Number of rows on page ',
        tableHead: '',
        tableCurentPage: 0,
        tableRowsOnPage: 20,
        tableWidthColumns: [],
        tableRowsOnPageSegment: 5,
        tableRowsOnPageMax:100,
        tableStepInterval: 10,
        buttons:{}
    },options);
    
    //   Create class ButtonBox -------------------------------------------------
    function ButtonBox(parent){
        this.widget = parent;
        this._parent = parent;
        this._buttons = options.buttons;
        this._element = parent.getButtonPanel();
        if ($.isEmptyObject(this._buttons)){
            this._element.html(' ');
        }else{
            var html = '<div class="fg-buttonset ui-buttonset fg-buttonset-multi ui-buttonset-multi">';                    
            for (var i in this._buttons){
                html += '<span class="buttonPadding fg-button ui-button ui-state-default">'+i+'</span>';
            }
            html +=  '</div>';
            this._element.html(html);
            var n = 0;
            for (var f in this._buttons){
                this._element.children('div').children('span').eq(n).bind('click',{
                    widget:parent
                },this._buttons[f]);
                n++;
            }
            this._element.children('div').children('span').not('.ui-state-disabled').hover(function(){
                $(this).addClass('ui-state-hover')
            },
            function(){
                $(this).removeClass('ui-state-hover');
            });
            this._element.children('div').children('span').not('.ui-state-disabled').bind('mousedown',function(){
                $(this).addClass('ui-state-active');
            })
            this._element.children('div').children('span').not('.ui-state-disabled').bind('mouseup',function(){
                $(this).removeClass('ui-state-active');
            })
            this._element.children('div').children('span').first().addClass('ui-corner-tl ui-corner-bl');
            this._element.children('div').children('span').last().addClass('ui-corner-tr ui-corner-br');

        }
            
    }
    //--------------------------------------------------------------------------
    
    //   Create class TableBox -------------------------------------------------
    function TableBox(parent){
        this.widget = parent.widget;
        this.parent = parent;
        this._template = parent._template;
        this._element = parent._template.getTable();
        this._curPage = parent._curPage;
        this._rowsOnPage = parent._rowsOnPage;
        this._Head = options.JSONHead;
        this._Data = options.JSONData;
        
        this.update = function (){
            var countColumn = this._Head.length;
            var value;
            var table = "<table border=1 cellspacing=0 cellpadding=1 style=\"width:100%;display:none\"><tr>";
            if(options.tableHead == ''){
                for (var i = 0;i<this._Head.length;i++){
                    table += "<td class=\"tableUiHead\">"+this._Head[i].replace(/[_]+/g,' ')+"</td>";
                }
            }else{
                table += options.tableHead;
            }
            table += "</tr>";
            for (i = countColumn*this._rowsOnPage*this._curPage;i< this._Data.length && i <countColumn*this._rowsOnPage+(countColumn*this._rowsOnPage*this._curPage); i+=countColumn){
                table += "<tr>";
                for (var j = i;j<i + countColumn;j++){
                    if (this._Data[j] == null){
                        value = "&nbsp;";
                    }else{
                        value = this._Data[j];
                    }
                    table+="<td class=\"tableUiData\">"+value+"</td>";
                } 
                table += "</tr>";
            }
            table += "</table>";
            this._element.replaceWith(table);
            this._element = parent._template.getTable();
            if ($('td',$('tr',this._element).last()).size() == options.tableWidthColumns.length){
                var widthTable = 0;
                for (var w = 0;w < options.tableWidthColumns.length; w++){
                    $('td',$('tr',this._element).last()).eq(w).css('width',parseInt(options.tableWidthColumns[w])+'px');
                    widthTable +=parseInt(options.tableWidthColumns[w]);
                }
                this._element.css('width',widthTable+'px');
            }
            this._element.css('display','table');
            // IE bug fix -----
            var ua = navigator.userAgent.toLowerCase();
            if (ua.indexOf("msie") != -1 && ua.indexOf("opera") == -1 && ua.indexOf("webtv") == -1) {
                this._element.css('display','block');
                var scrollHeight = this._element.parent('div').get(0).offsetHeight - this._element.parent('div').get(0).clientHeight;
                this._element.css('margin-bottom',scrollHeight + 'px');
            }
        // ----------------
        }
        this.OnChange = function(){
            this._curPage = parent._curPage;
            this._rowsOnPage = parent._rowsOnPage;
            this.update();
        }
    }
    //  ------------------------------------------------------------------------

    //   Create class TableSelected --------------------------------------------
    function TableSelected(parent){
        this.widget = parent.widget;
        this.parent = parent;
        this._template = parent._template;
        this._element = parent._template.getRowsSelected();
        this._curPage = parent._curPage;
        this._rowsOnPage = parent._rowsOnPage;
        this._tableBox = new TableBox(this);
        this.update = function(){
            var num = ((this._curPage)*this._rowsOnPage+this._rowsOnPage);
            if (parent._countRows< num){
                num = parent._countRows;
            }
            var html ='';
            if (parent._countRows == 0){
                html = '<label><span>Rows selected: 0</span></label>';
            }else{
                html = '<label><span>Selected  '+((this._curPage)*this._rowsOnPage+1)+' - '+num+'  of '+parent._countRows+'</span></label>';
            }
            this._element.html(html);
            this._tableBox.OnChange();
        }
        this.OnChange = function(){
            this._curPage = parent._curPage;
            this._rowsOnPage = parent._rowsOnPage;
            this.update();
        }
    }


    //   Create class TableListening -------------------------------------------
    function TableListing(parent){
        var curentObject = this;
        this.widget = parent.widget;
        this.parent = parent;
        this._template = parent._template;
        this._element = parent._template.getListing();
        this._curPage = options.tableCurentPage;
        this._rowsOnPage = parent._select;
        this._countRows = parent._countRows;
        this._stepInterval = options.tableStepInterval
        this.init = function(rowsOnPageValue){
            var maxPage = parseInt(this._countRows/rowsOnPageValue,10);
            if ((parseInt(this._countRows,10))%rowsOnPageValue!=0){
                maxPage++;
            }
            this._maxPage = maxPage;
        }
        this.init(this._rowsOnPage);
        this._curInterval = 0;
        this.getFirst = function(){
            return this._element.children('div').children('.first');
        }
        this.disabledFirst = function(){
            this.getFirst().addClass('ui-state-disabled');
        }
        this.enabledFirst = function(){
            this.getFirst().removeClass('ui-state-disabled');
        }
        this.getPrevious = function(){
            return this._element.children('div').children('.previous');
        }
        this.disabledPrevious = function(){
            this.getPrevious().addClass('ui-state-disabled');
        }
        this.enabledPrevious = function(){
            this.getPrevious().removeClass('ui-state-disabled');
        }
        this.getNext = function(){
            return this._element.children('div').children('.next');
        }
        this.disabledNext = function(){
            this.getNext().addClass('ui-state-disabled');
        }
        this.enabledNext = function(){
            this.getNext().removeClass('ui-state-disabled');
        }
        this.getLast = function(){
            return this._element.children('div').children('.last');
        }
        this.disabledLast = function(){
            this.getLast().addClass('ui-state-disabled');
        }
        this.enabledLast = function(){
            this.getLast().removeClass('ui-state-disabled');
        }
        this.getAllPages = function(){
            return this._element.children('div').children('span');
        }
        this._tableSelected = new TableSelected(this);
        this.update = function(){
            var html = '<div class="fg-buttonset ui-buttonset fg-buttonset-multi ui-buttonset-multi">\
                            <span class="first buttonPadding ui-corner-tl ui-corner-bl fg-button ui-button ui-state-default">First</span>\
                            <span class="previous buttonPadding fg-button ui-button ui-state-default">Previous</span>';
            for (var i = this._curInterval*this._stepInterval;i<(this._curInterval+1)*this._stepInterval&&i<this._maxPage;i++){
                if (i == this._curPage){
                    html += '<span class="buttonPadding fg-button ui-button ui-state-default ui-state-disabled">'+(i+1)+'</span>';
                }
                else{
                    html += '<span class="buttonPadding fg-button ui-button ui-state-default">'+(i+1)+'</span>';
                }
            }
            html +=  '<span class="next buttonPadding fg-button ui-button ui-state-default">Next</span>\
                <span class="last buttonPadding ui-corner-tr ui-corner-br fg-button ui-button ui-state-default">Last</span></div>';
            this._element.html(html);
            if (this._curInterval == 0){
                this.disabledFirst();
                this.disabledPrevious();
            }
            if ((this._curInterval+1)*this._stepInterval >= this._maxPage){
                this.disabledNext();
                this.disabledLast();
            }
            this._element.children('div').children('span').not('.ui-state-disabled').hover(function(){
                $(this).addClass('ui-state-hover')
            },
            function(){
                $(this).removeClass('ui-state-hover');
            });
            this.getAllPages().not('.ui-state-disabled').bind('click',function(){
                curentObject._curPage = parseInt($(this).text(),10)-1;
                curentObject.update();
            });
            this.getFirst().not('.ui-state-disabled').bind('click',function(){
                curentObject._curPage = 0;
                curentObject._curInterval = 0;
                curentObject.update();
            });
            this.getPrevious().not('.ui-state-disabled').bind('click',function(){
                curentObject._curInterval = curentObject._curInterval-1;
                curentObject._curPage = curentObject._stepInterval*curentObject._curInterval;
                curentObject.update();
            });
            this.getNext().not('.ui-state-disabled').bind('click',function(){
                curentObject._curInterval = curentObject._curInterval+1;
                curentObject._curPage = curentObject._stepInterval*curentObject._curInterval;
                curentObject.update();
            });
            this.getLast().not('.ui-state-disabled').bind('click',function(){
                curentObject._curInterval = parseInt((curentObject._maxPage-1)/curentObject._stepInterval,10)
                curentObject._curPage = curentObject._stepInterval*curentObject._curInterval;
                curentObject.update();
            });
            this._tableSelected.OnChange();
        }
        this.OnChange = function(){
            this._curPage = 0;
            this._rowsOnPage = parseInt(this.parent._select,10);
            this.init(this._rowsOnPage);
            this._curInterval = 0;
            this.update();
        }
        this.getCurentPage = function(){
            return this._curPage;
        }
        
    }
    //   -----------------------------------------------------------------------
    // Create class TableRowsOnPage --------------------------------------------
    function TableRowsOnPage (parent){
        var curentElement = this;
        this.widget = parent;
        this._template = parent;
        this._element = parent.getRowsOnPage();
        this._rowsSegment = options.tableRowsOnPageSegment;
        this._rowsMax = options.tableRowsOnPageMax;
        var rowsOnPage = options.tableRowsOnPage;
        if ((rowsOnPage+this._rowsSegment)>parent._countRows){
            rowsOnPage = (parseInt(parent._countRows/this._rowsSegment,10)+1)*this._rowsSegment;
        }
        this._select = rowsOnPage;
        this._countRows = parent._countRows;
        this._tableListing = new TableListing(this);
        this.update = function(){
            var html = '<label>'+options.labelRowsOnPage+'<select>';
            for (var i = this._rowsSegment;i<this._rowsMax && i< this._countRows+this._rowsSegment;i+=this._rowsSegment){
                html +='<option';
                if (i == this._select){
                    html +=' selected="selected" ';
                }
                html +=' value="'+i+'">'+i+'</option>';
            }
            html +='</select></label>';
            this._element.html(html);
            this._element.children('label').children('select').bind('change',function(){
                curentElement._select = parseInt($(this).filter('*[option:selected]').val(),10);
                curentElement._tableListing.OnChange();
            });
            this._tableListing.OnChange();
        }
        this.update();
        this.getRowsOnPage = function(){
            return this._select;
        }
    }
    // -------------------------------------------------------------------------

    // Create class Template ---------------------------------------------------
    function Template(element){
        var structureObject = '<div style="width:'+options.width+';height:'+options.height+'">'
        structureObject += '<div class="fg-toolbar ui-toolbar ui-widget-header ui-corner-tl ui-corner-tr ui-helper-clearfix" style="font-size:14px;min-height:5px;padding:5px">';
        structureObject +='<div class="tableRowsOnPage" style="float:left;"></div>';
        structureObject +='<div class="tableButtonPanel" style="float:right; "></div>';
        structureObject +='</div><div class="tableContent"><div><table style=\"width:100%;\"></table></div></div>';
        structureObject +='<div class="fg-toolbar ui-toolbar ui-widget-header ui-corner-bl ui-corner-br ui-helper-clearfix" style="font-size:14px;min-height:5px;padding:5px">';
        structureObject +='<div class="tableRowsSelected" style="float:left;"></div>';
        structureObject +='<div class="tableListing" style="float:right;"></div>';
        structureObject +='</div></div>';
        element.html(structureObject);
        var colorBorder = element.children('div').children('.ui-widget-header').css('border-left-color');
        element.children('div').children('.tableContent').css('border-left','1px solid '+colorBorder);
        element.children('div').children('.tableContent').css('border-right','1px solid '+colorBorder);
        var cssScrollX = {
            width:'100%',
            overflowX:'auto', 
            overflowY:'hidden',
            height:'auto'
        };
        element.children('div').children('.tableContent').children('div').css(cssScrollX);
        // Metods ---
        this.getTable = function(){
            return element.children('div').children('.tableContent').children('div').children('table');
        }
        this.getRowsOnPage = function(){
            return element.children('div').children('.ui-widget-header').children('.tableRowsOnPage');
        }
        this.getButtonPanel = function(){
            return element.children('div').children('.ui-widget-header').children('.tableButtonPanel');
        }
        this.getRowsSelected = function(){
            return element.children('div').children('.ui-widget-header').children('.tableRowsSelected');
        }
        this.getListing = function(){
            return element.children('div').children('.ui-widget-header').children('.tableListing');
        }
        if (!$.isEmptyObject(options.JSONHead)){
            if (options.JSONData.length%options.JSONHead.length == 0){
            this._countRows = options.JSONData.length/options.JSONHead.length;
            this._tableRowsOnPage = new TableRowsOnPage(this);
            }else{
                this.getTable().html( '<tr><td class="tableUiHead">No correct Data</td></tr>')
            }
        }else{
            this.getTable().html( '<tr><td class="tableUiHead">No Data found</td></tr>');
        }
        this.getRowsOnPage = function(){
            return this._tableRowsOnPage.getRowsOnPage();
        }
        this.getCurentPage = function(){
            return this._tableRowsOnPage._tableListing.getCurentPage();
        }
    }
    //  ------------------------------------------------------------------------
    return this.each(function() {
        var widget = new Template($(this));
        if (!$.isEmptyObject(options.JSONHead)){
            var buttonBox = new ButtonBox(widget);
        }
    });
}

