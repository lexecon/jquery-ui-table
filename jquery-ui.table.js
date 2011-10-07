/*
 * Copyright 2011 Alexey Krylov
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
(function($) {
    

    jQuery.fn.tableBlock = function(options){
        var options = jQuery.extend({
            width:'auto',
            height:'auto',
            showRowsOnPage: true,
            showButton: true,
            showRowsSelected: true,
            showListing: true,
            JSONHead: [],
            JSONData: [],
            labelRowsOnPage:'Number of rows on page ',
            positionRowsOnPage:'tl',
            positionListing:'br',
            positionSelected: 'bl',
            positionButtonBox: 'tr',
            tableHead: '',
            tableCurentPage: 0,
            tableRowsOnPage: 20,
            tableWidthColumns: [],
            tableRowsOnPageSegment: 5,
            tableRowsOnPageMax:100,
            tableStepInterval: 10,
            visibleRowsOnPage: true,
            getCellData:function(x, y, value){
                return '<td class="tableUiData">'+value+'</td>';
            },
            buttons:{}
        },options);
    

        var globalCurentPage = options.tableCurentPage;
        var globalRowsOnPage = options.tableRowsOnPage;
        var globarCountRows = 0;
        // Create class Template ---------------------------------------------------
        var TemplateClass = function (element){
            TemplateClass.prototype.element = element;
            this.arrayListener =[];
            var structureObject = '<div style="width:'+options.width+';height:'+options.height+'">'
            structureObject += '<div class="fg-toolbar ui-toolbar ui-widget-header ui-corner-tl ui-corner-tr ui-helper-clearfix" style="font-size:14px;padding:2px 5px 2px 5px;min-height:2px;overflow:hidden">';
            structureObject +='<div class="tlTemplate" style="float:left;overflow:hidden;height:2px"></div>';
            structureObject +='<div class="trTemplate" style="float:right;overflow:hidden; height:2px"></div>';
            structureObject +='</div><div class="tableContent"><div><table style=\"width:100%;\"></table></div></div>';
            structureObject +='<div class="fg-toolbar ui-toolbar ui-widget-header ui-corner-bl ui-corner-br ui-helper-clearfix" style="font-size:14px;padding:2px 5px 2px 5px">';
            structureObject +='<div class="blTemplate" style="float:left;overflow:hidden;height:2px"></div>';
            structureObject +='<div class="brTemplate" style="float:right;overflow:hidden;height:2px"></div>';
            structureObject +='</div></div>';
            element.html(structureObject);
            var colorBorder = element.children('div').children('.ui-widget-header').css('border-left-color');
            element.children('div').children('.tableContent').css('border-left','1px solid '+colorBorder);
            element.children('div').children('.tableContent').css('border-right','1px solid '+colorBorder);
            var cssScrollX = {
                width:'100%',
                overflowX:'auto', 
                overflowY:'hidden'
            };
            element.children('div').children('.tableContent').children('div').css(cssScrollX);
            this.init = function(){
                if (!$.isEmptyObject(options.JSONHead)){
                    if (options.JSONData.length%options.JSONHead.length == 0){
                        globarCountRows = options.JSONData.length/options.JSONHead.length;
                        this.OnChange();
                    }else{
                        this.getTable().html( '<tr><td class="tableUiHead">No correct Data</td></tr>')
                    }
                }else{
                    this.getTable().html( '<tr><td class="tableUiHead">No Data found</td></tr>');
                }
            }
        }
        TemplateClass.prototype.getCurentPage = function(){
            return globalCurentPage;
        }
        TemplateClass.prototype.setCurentPage = function(curPage){
            globalCurentPage = curPage;
        }
        TemplateClass.prototype.getRowsOnPage = function(){
            return globalRowsOnPage;
        }
        TemplateClass.prototype.setRowsOnPage = function(rowsOnPage){
            globalRowsOnPage = rowsOnPage;
        }
        TemplateClass.prototype.addArrayListener=function(arrayListener){
            this.arrayListener = arrayListener;
        }
        TemplateClass.prototype.OnChange = function(){
            for (var i = 0;i<this.arrayListener.length;i++){
                this.arrayListener[i].onChange(this);
            }
        }
        TemplateClass.prototype.getPartTemplate = function(position){
            return this.element.children('div').children('.ui-widget-header').children('.'+position+'Template');
        }
        TemplateClass.prototype.getTable = function(){
            return this.element.children('div').children('.tableContent').children('div').children('table');
        }
        TemplateClass.prototype.getCountRows = function(){
            return globarCountRows;
        }
        //  ------------------------------------------------------------------------
        // Create class TableRowsOnPage --------------------------------------------
        var TableRowsOnPage = function(){
            var curentElement = this;
            this.arrayListener =[];
            this._element = this.getPartTemplate(options.positionRowsOnPage);
            this._rowsSegment = options.tableRowsOnPageSegment;
            this._rowsMax = options.tableRowsOnPageMax;
            this.onChange = function(sender){
                var rowsOnPage = this.getRowsOnPage();
                if ((rowsOnPage+this._rowsSegment)>this.getCountRows()){
                    rowsOnPage = (parseInt(this.getCountRows()/this._rowsSegment,10)+1)*this._rowsSegment;
                }
                this.rowsOnPage = rowsOnPage;
                this.setRowsOnPage(rowsOnPage);
                this.rowsOnPage = this.getRowsOnPage();
                this._countRows = this.getCountRows();
                if (options.visibleRowsOnPage){
                    var html = '<label>'+options.labelRowsOnPage+'<select>';
                    for (var i = this._rowsSegment;i<this._rowsMax && i< this._countRows+this._rowsSegment;i+=this._rowsSegment){
                        html +='<option';
                        if (i == this.rowsOnPage){
                            html +=' selected="selected" ';
                        }
                        html +=' value="'+i+'">'+i+'</option>';
                    }
                    html +='</select></label>';
                    this._element.css('height','auto');
                    this._element.html(html);
                    this._element.children('label').children('select').bind('change',function(){
                        curentElement.rowsOnPage = parseInt($(this).filter('*[option:selected]').val(),10);
                        curentElement.setRowsOnPage(curentElement.rowsOnPage);
                        curentElement.setCurentPage(0);
                        curentElement.OnChange();
                    });
                }
                this.OnChange();
            }
        }
        var TemplateClassDo = function(){};
        TemplateClassDo.prototype = TemplateClass.prototype; 
        TableRowsOnPage.prototype = new TemplateClassDo();
        // -------------------------------------------------------------------------
        //   Create class TableListening -------------------------------------------
        var TableListing = function(){
            var curentObject = this;
            this.arrayListener=[];
            this._element = this.getPartTemplate(options.positionListing);
            this._stepInterval = options.tableStepInterval
            this.init = function(rowsOnPageValue){
                var maxPage = parseInt(this._countRows/rowsOnPageValue,10);
                if ((parseInt(this._countRows,10))%rowsOnPageValue!=0){
                    maxPage++;
                }
                this._maxPage = maxPage;
            }
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
            this.update = function(){
                this._curPage = this.getCurentPage();
                this._rowsOnPage = this.getRowsOnPage();
                this._countRows = this.getCountRows();
                this.init(this._rowsOnPage);
                if(this._curInterval == undefined){
                    this._curInterval = parseInt(this._maxPage/this._stepInterval,10);
                }
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
                this._element.css('height','auto');
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
                    curentObject.setCurentPage(curentObject._curPage);
                    curentObject.update();
                });
                this.getFirst().not('.ui-state-disabled').bind('click',function(){
                    curentObject._curPage = 0;
                    curentObject.setCurentPage(curentObject._curPage);
                    curentObject._curInterval = 0;
                    curentObject.update();
                });
                this.getPrevious().not('.ui-state-disabled').bind('click',function(){
                    curentObject._curInterval = curentObject._curInterval-1;
                    curentObject._curPage = curentObject._stepInterval*curentObject._curInterval;
                    curentObject.setCurentPage(curentObject._curPage);
                    curentObject.update();
                });
                this.getNext().not('.ui-state-disabled').bind('click',function(){
                    curentObject._curInterval = curentObject._curInterval+1;
                    curentObject._curPage = curentObject._stepInterval*curentObject._curInterval;
                    curentObject.setCurentPage(curentObject._curPage);
                    curentObject.update();
                });
                this.getLast().not('.ui-state-disabled').bind('click',function(){
                    curentObject._curInterval = parseInt((curentObject._maxPage-1)/curentObject._stepInterval,10)
                    curentObject._curPage = curentObject._stepInterval*curentObject._curInterval;
                    curentObject.setCurentPage(curentObject._curPage);
                    curentObject.update();
                });
                this.OnChange();
            }
            this.onChange = function(sender){
                this.update();
            }
        
        }
        TableListing.prototype = new TemplateClassDo();
        //   -----------------------------------------------------------------------
        //   Create class TableSelected --------------------------------------------
        var TableSelected = function(){
            this.arrayListener=[];
            this._element = this.getPartTemplate(options.positionSelected);
            this._curPage = this.getCurentPage();
            this._rowsOnPage = this.getRowsOnPage();
            this.update = function(){
                var num = ((this._curPage)*this._rowsOnPage+this._rowsOnPage);
                if (this.getCountRows()< num){
                    num = this.getCountRows();
                }
                var html ='';
                if (this.getCountRows() == 0){
                    html = '<label><span>Rows selected: 0</span></label>';
                }else{
                    html = '<label><span>Selected  '+((this._curPage)*this._rowsOnPage+1)+' - '+num+'  of '+this.getCountRows()+'</span></label>';
                }
                this._element.css('height','auto');
                this._element.html(html);
                this.OnChange();
            }
            this.onChange = function(sender){
                this._curPage = this.getCurentPage();
                this._rowsOnPage = this.getRowsOnPage();
                this.update();
            }
        }
        TableSelected.prototype = new TemplateClassDo();
        //   -----------------------------------------------------------------------
        //   Create class TableBox -------------------------------------------------
        var TableBox = function (){
            this.arrayListener=[];
            this._element = this.getTable();
            this._curPage = this.getCurentPage();
            this._rowsOnPage = this.getRowsOnPage();
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
                var x =0;
                var y = 0;
                for (i = countColumn*this._rowsOnPage*this._curPage;i< this._Data.length && i <countColumn*this._rowsOnPage+(countColumn*this._rowsOnPage*this._curPage); i+=countColumn){
                    table += "<tr>";
                    for (var j = i;j<i + countColumn;j++){
                        if (this._Data[j] == null){
                            value = "&nbsp;";
                        }else{
                            value = this._Data[j];
                        }
                        table+=options.getCellData(x, y, value);
                        x++;
                    } 
                    x=0;
                    y++;
                    table += "</tr>";
                }
                table += "</table>";
                this._element.replaceWith(table);
                this._element = this.getTable();
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
            this.onChange = function(sender){
                this._curPage = sender.getCurentPage();
                this._rowsOnPage = sender.getRowsOnPage();
                this.update();
            }
        }
        TableBox.prototype = new TemplateClassDo();
        //  ------------------------------------------------------------------------
        //   Create class ButtonBox -------------------------------------------------
        var ButtonBox = function(){
            this.arrayListener=[];
            var curentElement = this;
            this._buttons = options.buttons;
            this._element = this.getPartTemplate(options.positionButtonBox);
            this.onChange = function(){
                if ($.isEmptyObject(this._buttons)){
                    this._element.html(' ');
                }else{
                    var html = '<div class="fg-buttonset ui-buttonset fg-buttonset-multi ui-buttonset-multi">';                    
                    for (var i in this._buttons){
                        html += '<span class="buttonPadding fg-button ui-button ui-state-default">'+i+'</span>';
                    }
                    html +=  '</div>';
                    this._element.css('height','auto');
                    this._element.html(html);
                    var n = 0;
                    for (var f in this._buttons){
                        this._element.children('div').children('span').eq(n).bind('click',{
                            widget:curentElement
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
            
        }
        ButtonBox.prototype = new TemplateClassDo();
        //--------------------------------------------------------------------------
        var widget = new TemplateClass($(this));
        var tableListing = new TableListing();
        var rowsOnPage = new TableRowsOnPage();
        var tableSelected = new TableSelected();
        var tableBox = new TableBox();
        var buttonBox = new ButtonBox();
        this.getWidget = function(){
                return widget;
            }
        this.each(function() {
        
            widget.addArrayListener([rowsOnPage, buttonBox]);
            rowsOnPage.addArrayListener([tableListing]);
            tableListing.addArrayListener([tableSelected]);
            tableSelected.addArrayListener([tableBox]);
            widget.init();
        
        /*if (!$.isEmptyObject(options.JSONHead)){
            var buttonBox = new ButtonBox(widget);
        }*/
        });
        return this;
    }

})(jQuery);