JSONHead = ['Head1','Head2','Head3','Head4','Head5'];
JSONData = ['11','12','13','14','15','21','22','23','24','25','31','32','33','34','35','41','42','43','44','45','51','52','53','54','55','61','62','63','64','65','71','72','73','74','75','81','82','83','84','85','91','92','93','94','95','10 1','10 2','10 3','10 4','10 5','11 1','11 2','11 3','11 4','11 5','12 1','12 2','12 3','12 4','12 5','13 1','13 2','13 3','13 4','13 5','14 1','14 2','14 3','14 4','14 5','15 1','15 2','15 3','15 4','15 5','16 1','16 2','16 3','16 4','16 5']
$(document).ready(function(){
    $('#tabs').tabs();
    $('#tabs').bind('tabsselect', function(event, ui) {
                if (ui.index == 2){
                    loadExample();
                }  
                
            });
    
});
function loadExample(){
    $('#example1').tableBlock({
        JSONHead:JSONHead,
        JSONData:JSONData,
        tableRowsOnPage:5
    });
    $('#example2').tableBlock({
        JSONHead:JSONHead,
        JSONData:JSONData,
        tableRowsOnPage:5,
        getSelectedHtml:function(countRows, startRows, endRows){
            if (countRows == 0){
                return  '<label><span>Ничего не найдено</span></label>';
            }else{
                return '<label><span>Выбранны страницы с '+startRows+' по '+endRows+'  из '+countRows+'</span></label>';
            }
        },
        getCellData:function(x, y, value){
            if (x==2 && y ==3){
                return '<td class="tableUiData">Changed value =<a href="">'+value+'</a></td>';
            }else{
                return '<td class="tableUiData">'+value+'</td>';
            }
        },
        positionRowsOnPage:'',
        positionListing:'bl',
        positionSelected: 'br',
        positionButtonBox: ''
    });
    $('#example3').tableBlock({
        JSONHead:JSONHead,
        JSONData:JSONData,
        tableRowsOnPage:20,
        positionRowsOnPage:'',
        positionListing:'',
        positionSelected: '',
        positionButtonBox: '',
        positionLabel:'tc',
        scroll:'y',
        heightTableContent:'150px',
        labelText:'scroll-y',  
        highlighting: true
    });
}