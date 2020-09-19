define([
    'jquery',
    'kendo',
    'util',
    'i18n!../../js/common/nls/main.js',
    'i18n!./nls/wholesaleContent.js',
    'text!./templates/wholesale-crm-tasks.html',
    'text!./templates/wholesale-crm-tasks-form.html',
    'css!./css/wholesaleContent'
], function ($, k, u, common, local, template, formTemplate) {

    var templateTmpl = k.template(template);
    // var formTemplateTmpl = k.template(formTemplate);

    var public = {
        myModuleName: 'WholesaleCrmTasksMvts',
        run: function(params) {
            var tmp = params.treeId.split('-');// <-- treeId = 0-3
            this.el = params.el;
            this.taskId = tmp[1];
            
            this.i18n = $.extend(common, local);
            private.render.call(this);
            private.bindEvents.call(this);
        },
        onClickSubmitBtn: function(btn) {
            var that = this;
            $.ajax({
                url: app.wholesaleServerUrl+'crm_task.php?method=set_mvts_table1',
                type:'post',
                data: this.serialize(),
                success: function(resp){
                    var r=JSON.parse(resp);
                    if(r.success){
                        app.showPopupMsg('good',that.i18n.info.title,that.i18n.info.saveComplete);
                    }else{
                        app.showPopupMsg('bad',that.i18n.info.title,that.i18n.err.crytical);
                    }
                }
            });
        }
    };
    var private = {
        bindEvents: function() {
            var that = this;
            // $(document).off('click', '.crm-tasks-form-submit-btn').on('click', '.crm-tasks-form-submit-btn', function(e) {
            //     e.preventDefault();
            //     that.onClickSubmitBtn.call(that, $(this));
            // });
            $(document).on('submit', 'form', function(event) {
                event.preventDefault();

                var theSubmittedForm = $(event.target);
                // theSubmittedForm.serialize();
                // var serializedForm = theSubmittedForm.serialize();
                // serializedForm += "&tableId=" + encodeURIComponent(theSubmittedForm[0].name);
                var dataZ = theSubmittedForm.serializeArray();

                $.ajax({
                    url: app.wholesaleServerUrl+'crm_task.php?method=set_mvts_table',
                    type:'post',
                    data: {
                        tableId: theSubmittedForm[0].name,
                        data: dataZ
                    },
                    success: function(resp){
                        var r=JSON.parse(resp);
                        if(r.success){
                            app.showPopupMsg('good',that.i18n.info.title,that.i18n.info.saveComplete);
                        }else{
                            app.showPopupMsg('bad',that.i18n.info.title,that.i18n.err.crytical);
                        }
                    }
                });
            });
        },
        getDropdownsData: function (selector, inputField) {
            $.ajax({
                url: app.wholesaleServerUrl + selector,
                type: 'post',
                data: {
                    user: app.getActiveUser()
                },
                success: function (resp) {
                    var r = JSON.parse(resp);
                    if (r.success) {
                        var dataFields = Object.getOwnPropertyNames(r.data.list[0]);
                        private.applyDropdowns(r.data.list, dataFields, inputField);
                    }
                }
            });
        },
        applyDropdowns: function(values, dataFields, inputField) {
            $('#'+inputField+'Id').kendoDropDownList({
                autoBind: true,
                dataValueField: dataFields[0],
                dataTextField: dataFields[1],
                dataSource: values
            }).data('kendoDropDownList');
        },
        buildForm: function(response, that){
            var inputsArr = [],
                viewModel = [],
                dataForms = [],
                selectors = [];

            for (var i = 0, lengthResp = response.length; i < lengthResp; i++) {
                for (var prop in response[i].data) {
                    if (response[i].data.hasOwnProperty(prop)) {
                        // перенос имени в тело json
                        response[i].data[prop].name = prop;
                        inputsArr.push(response[i].data[prop]);
                        //создание массива селекторов
                        if(response[i].data[prop].type === 'selector') {
                            selectors.push(response[i].data[prop]);
                        }
                    }
                }
                var inputsModel = {//wrap for kendo observable
                    data: inputsArr
                };
                inputsArr = [];
                dataForms.push({//for creating forms
                    number: i,
                    table_nm: response[i].table_nm,
                    table: response[i].table
                });
                viewModel.push(kendo.observable(inputsModel));
            }
            var template = kendo.template(formTemplate);

            var result = kendo.render(template, dataForms); //render the template
            $("#forms-wrapper").html(result); //append the result to the page
            for (var z = 0 ; z < viewModel.length; z++) {
                kendo.bind($("#wholesale-crm-tasks-form-"+z), viewModel[z]);
            }
            for (var j = 0 ; j < selectors.length; j++) {
                private.getDropdownsData(selectors[j].reg, selectors[j].name);
            }
            var checkboxes = $('input[type="checkbox"]');
            checkboxes.change(function(){
                this.value = (Number(this.checked));
            });
            $.each(checkboxes, function(){
                $("input[value='1']").prop('checked', true);
            });

            // stable
            /*for (var prop in response[0].data) {
                if (response[0].data.hasOwnProperty(prop)) {
                    response[0].data[prop].name = prop;
                    inputsArr.push(response[0].data[prop]);
                }
            }

            var inputsModel = {
                data: inputsArr,
                table_nm: response[0].table_nm,
                table: response[0].table
            };

            var viewModel = kendo.observable(inputsModel);
            // bind the model to the container
            kendo.bind($("#crm-tasks-wrapper"), viewModel);*/
            // stable
        },
        render: function(){
            var that=this;
            var html=templateTmpl({
                i18n:that.i18n
            });
            that.el.html(html);

            $.ajax({
                url: app.wholesaleServerUrl + 'crm_task.php?method=get_mvts_table',
                type: 'post',
                data: {
                    user: app.getActiveUser(),
                },
                success: function (resp) {
                    var r = JSON.parse(resp);
                    private.buildForm(r, that);
                    // convert the JSON to observable object
                }
            });
            var validator = that.el.find("#example").kendoValidator().data("kendoValidator");
            that.el.find('.combobox').kendoComboBox();
            that.el.find('.tabstrip').kendoTabStrip({
                animation:{
                    open:{
                        effects: "fadeIn"
                    }
                }
            });

        }
    };
    return public;
});
