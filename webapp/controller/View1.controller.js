sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageBox",
    "sap/m/MessageToast"
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller, MessageBox, MessageToast) {
        "use strict";

        return Controller.extend("orovillenmsp.orovilleapp.controller.View1", {
            onInit: async function () {
                var oView = this.getView("Index");
                var oModel = new sap.ui.model.json.JSONModel();
                var dataModel = this.getOwnerComponent().getModel("data");
                sap.ui.core.BusyIndicator.show();
                var oDateFormat = sap.ui.core.format.DateFormat.getDateInstance({
                    pattern: "yyyyMMdd"
                });
                var oDateFormat1 = sap.ui.core.format.DateFormat.getDateInstance({
                    pattern: "M/d/yy"
                });
                var dataModel = this.getOwnerComponent().getModel("data");
                var McDate = oDateFormat.format(new Date());

                 var todayRmrk = oDateFormat.format(new Date());
                 var today = oDateFormat1.format(new Date());
                 dataModel.setProperty("/valDateFormatted", today);
                 
                 //var lbl_exp = this.getView("View1").byId("lbl_exp_date0").setVisible=("false");
                 

                 //Se puede obtener el objeto que necesitamos modificar por medio del id del mismo objeto
                 //this.getView("View1").byId("lbl_hddate").setText(dataModel.oData.valDate);

            //#region User
            var serviceCatUrl = "/sap/opu/odata/sap/ZODATA_MC_CATALOGUES_C_SRV/";
                var OdataServiceCat = new sap.ui.model.odata.ODataModel(serviceCatUrl, true);
                var UsrData = "";

                if (!(typeof OdataServiceCat === "undefined") || !(typeof OdataServiceCat === "null")) {
                    //var usrOdata = this.getUserSrv(UsrModel);
                    //var usrSrv = await this.UsrRead(UsrModel, UsrData);
                    var usrSrv = await this.getUserSrv(OdataServiceCat, UsrData);
                    if (usrSrv[0].result === "ERROR") {
                        sap.ui.core.BusyIndicator.hide();
                        MessageBox.error((usrSrv[0].data));
                    }
                    else {


                        //#region WcdByDivision
                        //var servicetbl1Url = "/sap/opu/odata/sap/ZODATA_MC_CATALOGUES_C_SRV/";
                        //var Tbl1Model = new sap.ui.model.odata.ODataModel(serviceCatUrl, true);
                        var TblWcdData = "";
                        var WcdSrv = await this.getWcdSrv(OdataServiceCat, TblWcdData);
                        if (WcdSrv[0].result === "ERROR") {
                            sap.ui.core.BusyIndicator.hide();
                            MessageBox.error((WcdSrv[0].data));
                        }
                        else {
                            //#region UnitStatDivision
                            //var servicetbl2Url = "/sap/opu/odata/sap/ZODATA_MC_CATALOGUES_C_SRV/";
                            //var TblPusRepModel = new sap.ui.model.odata.ODataModel(servicetbl2Url, true);
                            var TblPusRepData = "";
                            var PusRepSrv = await this.getPusRepSrv(OdataServiceCat, TblPusRepData);
                            if (PusRepSrv[0].result === "ERROR") {
                                sap.ui.core.BusyIndicator.hide();
                                MessageBox.error((PusRepSrv[0].data));

                            }
                            else {
                                
                                var srvRmrksUrl = " /sap/opu/odata/sap/ZODATA_MC_WRDTREM_OR_SRV/";
                                var OdataSrvRmrks = new sap.ui.model.odata.ODataModel(srvRmrksUrl, true);
                                var RmrksData = "";
                                var rmrksSrv = await this.getRmrksSrv(OdataSrvRmrks, RmrksData);
                                if (rmrksSrv[0].result === "ERROR") {
                                    sap.ui.core.BusyIndicator.hide();
                                    MessageBox.error((rmrksSrv[0].data));
                                }
                                else {
                                    
                                    var srvMidNgthConUrl = "/sap/opu/odata/sap/ZODATA_MC_WROR_SRV/";
                                    var OdataSrvData = new sap.ui.model.odata.ODataModel(srvMidNgthConUrl, true);
                                    var MidNgthCon = "";
                                    var MidNgthConSrv = await this.getMidNgthConSrv(OdataSrvData, RmrksData);
                                    if (MidNgthConSrv[0].result === "ERROR") {
                                        sap.ui.core.BusyIndicator.hide();
                                        MessageBox.error((MidNgthConSrv[0].data));
                                    }
                                    else {
                                 
                                     dataModel=this.SetData(usrSrv,WcdSrv,PusRepSrv,rmrksSrv,MidNgthConSrv,McDate,dataModel)
                                     if (MidNgthConSrv[0].data.results[0].Mcdate === oDateFormat.format(new Date())) {
                                    // if ("DUMMY" === oDateFormat.format(new Date())) {
                                        var btnSb = oView.byId("btn_Submit");
                                        btnSb.setEnabled(false);
                                        MessageBox.warning("This form has been successfully submitted.\n\r" +
                                            "No other midnight condition report for this date may be created or submitted");
                                        dataModel.setProperty("/valSubmitted", "This form has been submitted")

                                    }


                                    }
                                }
                            }


                        }




                    }


                }
                else {
                    MessageBox.error("Error with service: /sap/opu/odata/sap/ZODATA_MC_CATALOGUES_C_SRV/");
                }

                var dummy = "";
                oModel.setData(null);
                oModel = dataModel;
                oView.setModel(oModel);
                sap.ui.core.BusyIndicator.hide();


                var object;
                //object = this.getView("View1").byId("ipt_CliftCourt6_elevation");
                object = oView.byId("ipt_JurCtrlChk21");
                var decAll = 0;
                decAll = this.getDecAll(object)
                this.addEvent(object, "ipt_JurCtrlChk21", "valJurCtrlChk", decAll);



            },

            getUserSrv: async function (UsrModel, data) {
                //Esto sirve para saber si una variables ya esta definida
                var resolve = "";
                var reject = "";
                const oPromise = await new Promise(function (resolve, reject) {
                    UsrModel.read("/USER_ADDRSet", {
                        //urlParameters: {
                        //  "$top" : 1
                        //},
                        success: (oData) => {
                            //alert(oData.results[0].Accm);
                            //alert(oResponse);
                            resolve({ result: "SUCCESS", data: oData });
                            var UsrData = oData;
                            var UsrResp = oResponse;

                            //#endregion
                        },

                        error: (oData) => {
                            var usrError = ("Conection Error\n\r" + "URL: " + oData.response.requestUri.valueOf(Text) + "\n\rStatus: " + oData.response.statusCode.valueOf(Text) + "\n\rBody:" + oData.response.body.valueOf(Text));
                            resolve({ result: "ERROR", data: usrError });
                            reject(oData);
                            //MessageBox.error(usrError);

                        },

                    });

                });
                //data = oPromise.results;
                return [oPromise];

            },
            getWcdSrv: async function (UsrModel, data) {
                //Esto sirve para saber si una variables ya esta definida
                var resolve = "";
                var reject = "";
                const oPromise = await new Promise(function (resolve, reject) {
                    UsrModel.read("/WcdByDivision", {
                        urlParameters: {
                            "Div": "'WROR'"
                            //"$top" : 1
                        },
                        success: (oData) => {
                            //alert(oData.results[0].Accm);
                            //alert(oResponse);
                            resolve({ result: "SUCCESS", data: oData });
                            var UsrData = oData;
                            var UsrResp = oResponse;

                            //#endregion
                        },

                        error: (oData) => {
                            var usrError = ("Conection Error\n\r" + "URL: " + oData.response.requestUri.valueOf(Text) + "\n\rStatus: " + oData.response.statusCode.valueOf(Text) + "\n\rBody:" + oData.response.body.valueOf(Text));
                            resolve({ result: "ERROR", data: usrError });
                            reject(oData);
                            //MessageBox.error(usrError);

                        },


                    });

                });
                //data = oPromise.results;
                return [oPromise];

            },
            getPusRepSrv: async function (UsrModel, data) {
                //Esto sirve para saber si una variables ya esta definida
                var resolve = "";
                var reject = "";
                const oPromise = await new Promise(function (resolve, reject) {
                    UsrModel.read("/UnitStatDivision", {
                        urlParameters: {
                            "Divis": "'WROR'"
                            //"$top" : 1
                        },
                        success: (oData) => {
                            //alert(oData.results[0].Accm);
                            //alert(oResponse);
                            resolve({ result: "SUCCESS", data: oData });
                            var UsrData = oData;
                            var UsrResp = oResponse;

                            //#endregion
                        },

                        error: (oData) => {
                            var usrError = ("Conection Error\n\r" + "URL: " + oData.response.requestUri.valueOf(Text) + "\n\rStatus: " + oData.response.statusCode.valueOf(Text) + "\n\rBody:" + oData.response.body.valueOf(Text));
                            resolve({ result: "ERROR", data: usrError });
                            reject(oData);
                            //MessageBox.error(usrError);

                        },


                    });

                });
                //data = oPromise.results;
                return [oPromise];

            },
            getRmrksSrv: async function (UsrModel, data) {
                //Esto sirve para saber si una variables ya esta definida
                var resolve = "";
                var reject = "";
                const oPromise = await new Promise(function (resolve, reject) {
                    UsrModel.read("/ZWCM_MC_WROR_REMARKSSet", {
                        // urlParameters: {
                        //"Divis": "'WRSJ'"
                        //"$top" : 1
                        //},
                        success: (oData) => {
                            //alert(oData.results[0].Accm);
                            //alert(oResponse);
                            resolve({ result: "SUCCESS", data: oData });
                            var UsrData = oData;
                            var UsrResp = oResponse;

                            //#endregion
                        },

                        error: (oData) => {
                            var usrError = ("Conection Error\n\r" + "URL: " + oData.response.requestUri.valueOf(Text) + "\n\rStatus: " + oData.response.statusCode.valueOf(Text) + "\n\rBody:" + oData.response.body.valueOf(Text));
                            resolve({ result: "ERROR", data: usrError });
                            reject(oData);
                            //MessageBox.error(usrError);

                        },


                    });

                });
                //data = oPromise.results;
                return [oPromise];

            },
            getMidNgthConSrv: async function (UsrModel, data) {
                //Esto sirve para saber si una variables ya esta definida
                var resolve = "";
                var reject = "";
                const oPromise = await new Promise(function (resolve, reject) {
                    UsrModel.read("/ZSWCM_MC_WRORSet", {
                        // urlParameters: {
                        //"Divis": "'WRSJ'"
                        //"$top" : 1
                        //},
                        success: (oData) => {
                            //alert(oData.results[0].Accm);
                            //alert(oResponse);
                            resolve({ result: "SUCCESS", data: oData });
                            var UsrData = oData;
                            var UsrResp = oResponse;

                            //#endregion
                        },

                        error: (oData) => {
                            var usrError = ("Conection Error\n\r" + "URL: " + oData.response.requestUri.valueOf(Text) + "\n\rStatus: " + oData.response.statusCode.valueOf(Text) + "\n\rBody:" + oData.response.body.valueOf(Text));
                            resolve({ result: "ERROR", data: usrError });
                            reject(oData);
                            //MessageBox.error(usrError);

                        },


                    });

                });
                //data = oPromise.results;
                return [oPromise];

            },

            OnCbxChng: function (evt) {
                var view = this.getView("View1");
                var model = view.getModel();
                var secIcon = view.byId(evt.getSource().data("icon"));
                var cbxId = evt.getSource().data("cbxName");
                var dataSrc = evt.getSource().data("dataSource");
                var selKey = evt.getSource().data("selkey");
                var cbx = view.byId([cbxId]);
                var cbxJson = view.getModel().getData();
                var list = cbxJson[dataSrc];
                var flag = "";
                var exp_date1 = view.byId("lbl_exp_date0");
                var datePiExp1 = view.byId("SecTLExpD0");
                var exp_date2 = view.byId("lbl_exp_date1");
                var datePiExp2 = view.byId("SecTLExpD1");



                for (let index = 0; index < list.length; index++) {
                    if (list[index].text === cbx.getValue()) {
                        flag = "X";
                        break;
                    }

                }
                if (flag === "") {

                    sap.m.MessageBox.error("Select a valid value.");
                    cbxJson[selKey] = list[0].key.toString();
                    model.setData("");
                    model.setData(cbxJson);
                    view.setModel(model);
                }


                if (cbxId === "cbx_SecThreatLvls_nat" || cbxId === "cbx_SecThreatLvls_dwr") {
                    //Se obtiene la vista, lo cual nos da acceso a todos los componentes en ella.
                    //var oView = this.getView("View1");
                    //var model = oView.getModel();
                    //var json = model.getData();
                    //var cbx = oView.byId(evt.getSource().data("obj_name"));
                    var val = cbx._getSelectedItemText();

                    //lbl.removeStyleClass("cbx_green");
                    //lbl.removeStyleClass("cbx_orange");
                    //lbl.removeStyleClass("cbx_red");
                    
                  

                    switch (val) {
                        
                        case "NORMAL":
                            // lbl.addStyleClass("cbx_green");
                            secIcon.setBackgroundColor("green");
                            secIcon.setColor("green");
                           // exp_date["bOutput"]="invisible";
                           if (cbxId === "cbx_SecThreatLvls_nat")
                           {
                           exp_date1.setVisible(false);
                           datePiExp1.setVisible(false);
                           }
                           else{
                            exp_date2.setVisible(false);
                            datePiExp2.setVisible(false);
                           }

                           
                            break;
                        case "ELEVATED":
                            // lbl.addStyleClass("cbx_orange");
                            secIcon.setBackgroundColor("orange");
                            secIcon.setColor("orange");
                            if (cbxId === "cbx_SecThreatLvls_nat")
                            {
                            datePiExp1.setVisible(true);
                            exp_date1.setVisible(true);
                            }
                            else{
                                exp_date2.setVisible(true);
                                datePiExp2.setVisible(true);

                            }
                            break;
                        case "IMMINENT":
                            //lbl.addStyleClass("cbx_red");
                            secIcon.setBackgroundColor("red");
                            secIcon.setColor("red");
                            if (cbxId === "cbx_SecThreatLvls_nat")
                            {
                            datePiExp1.setVisible(true);
                            exp_date1.setVisible(true);
                            }
                            else{
                                exp_date2.setVisible(true);
                                datePiExp2.setVisible(true);
                            }
                            break;
                        default:
                            if (cbxId === "cbx_SecThreatLvls_nat"){
                            model.setProperty("/keyStlNat1", "");
                            }
                            else {
                            model.setProperty("/keyStlNat2", "");                               
                            }
                            secIcon.setBackgroundColor("");
                            secIcon.setColor("");
                            break;
                    }
                }
                //if (cbx.value() && cbx.selectedIndex == -1) {
                //var dt = this.dataSource._data[0];
                //  cbx.text("");


            },
            /**Los objetos de tipo boton, tienen un evento llamado press, este evento se dispara al pulsar el botón */
            onClear: function (evt) {
                /**var fid = evt.getSource().getId();
                var id = fid.split(/--/)
                var idt = id[2];
                idt = "ipt"+idt.substring(3,idt.length); TODO ESTO SE REEMPLAZA POR PARAMETRO*/
                var objid = evt.getSource().data("id");//Se obtiene el valor del parámetro enviado desde la vista "id"
                this.getView("View1").byId(objid).setValue("");
            },


            SetData: function (userData, wcdData, plantData, rmrksData, MidCondData, date, model) {
                var oDateFormat1 = sap.ui.core.format.DateFormat.getDateInstance({
                    pattern: "M/d/yy"
                });

                var today = oDateFormat1.format(new Date());
                var oView = this.getView("View1");
                var dataModel = model;
                var ctrllr = oView.getController();
                var obj = "";
                var UsrData = userData[0].data.results[0];
                var exp_date1 = oView.byId("lbl_exp_date0");
                var datePiExp1 = oView.byId("SecTLExpD0");
                var exp_date2 = oView.byId("lbl_exp_date1");
                var datePiExp2 = oView.byId("SecTLExpD1");
                dataModel.setProperty("/valDate", date);
                dataModel.setProperty("/valUsrName", UsrData.Bname);
                dataModel.setProperty("/valMcdate", date);
                dataModel.setProperty("/valDateFormatted", today);
                dataModel.setProperty("/valOpName", UsrData.NameTextc);
                //#region Security Threat Levels
                var iconSec = oView.byId("SecThr_color");
                var iconDWR = oView.byId("SecDwr_color");
                
                switch (MidCondData[0].data.results[0].Natsec) {
                    case "NORMAL":
                        dataModel.setProperty("/val_lstStlNat", "keyStlNat1");
                        iconSec.setBackgroundColor("green");
                        iconSec.setColor("green");
                        exp_date1.setVisible(false);
                        datePiExp1.setVisible(false);

                        break;
                    case "ELEVATED":
                        dataModel.setProperty("/val_lstStlNat", "keyStlNat2");
                        iconSec.setBackgroundColor("orange");
                        iconSec.setColor("orange");
                        exp_date1.setVisible(true);
                        datePiExp1.setVisible(true);

                        break;
                    case "IMMINENT":
                        dataModel.setProperty("/val_lstStlNat", "keyStlNat3");
                        iconSec.setBackgroundColor("red");
                        iconSec.setColor("red");
                        exp_date1.setVisible(true);
                        datePiExp1.setVisible(true);

                        break;
                    default:
                        dataModel.setProperty("/val_lstStlNat", "");
                        break;
                }

                switch (MidCondData[0].data.results[0].Isoreg) {
                    case "ON":
                        dataModel.setProperty("/val_lstCCISoReg", "keylstCCISoReg1");


                        break;
                    case "OFF":
                        dataModel.setProperty("/val_lstCCISoReg", "keylstCCISoReg2");

                        break;
                        default:
                        
                        dataModel.setProperty("/val_lstCCISoReg", "");
                        iconDWR.setBackgroundColor("");
                        iconDWR.setColor("");
                        break;
                }
            

                switch (MidCondData[0].data.results[0].Dwrsec) {
                    case "NORMAL":
                        dataModel.setProperty("/val_lstStlDwr", "keyStlDwr1");
                        iconDWR.setBackgroundColor("green");
                        iconDWR.setColor("green");
                        exp_date2.setVisible(false);
                        datePiExp2.setVisible(false);
                        //var lbl = view.byId("lbl_SecThreatLvls_dwr_color");
                        //lbl.addStyleClass("cbx_green");
                        break;
                    case "ELEVATED":
                        model.setProperty("/val_lstStlDwr", "keyStlDwr2");
                        iconDWR.setBackgroundColor("orange");
                        iconDWR.setColor("orange");
                        exp_date2.setVisible(true);
                        datePiExp2.setVisible(true);
                        //var lbl = view.byId("lbl_SecThreatLvls_dwr_color");
                        //lbl.addStyleClass("cbx_orange");
                        break;
                    case "IMMINENT":
                        dataModel.setProperty("/val_lstStlDwr", "keyStlDwr3");
                        iconDWR.setBackgroundColor("red");
                        iconDWR.setColor("red");
                        exp_date2.setVisible(true);
                        datePiExp2.setVisible(true);
                        //var lbl = view.byId("lbl_SecThreatLvls_dwr_color");
                        //lbl.addStyleClass("cbx_red");
                        break;

                    default:
                        
                        dataModel.setProperty("/val_lstStlDwr", "");
                        iconDWR.setBackgroundColor("");
                        iconDWR.setColor("");
                        break;
                }

                    //complex voltage combo box
            
                switch (MidCondData[0].data.results[0].Complxvolt) {
                case "UNITY":
                    dataModel.setProperty("/val_lstCCCVolt", "keylstCClstCCCVolt1");


                    break;
                case "BUCK":
                    dataModel.setProperty("/val_lstCCCVolt", "keylstCClstCCCVolt2");

                    break;

                    case "BOOST":
                        dataModel.setProperty("/val_lstCCCVolt", "keylstCClstCCCVolt3");

                        break;
                    default:
                    
                    dataModel.setProperty("/val_lstCCCVolt", "");
                    iconDWR.setBackgroundColor("");
                    iconDWR.setColor("");
                    break;
                }

                switch (MidCondData[0].data.results[0].Complex) {
                case "GEN MODE":
                    dataModel.setProperty("/val_lstCCCIn", "keylstCCCIn1");


                    break;
                case "PUMP MODE":
                    dataModel.setProperty("/val_lstCCCIn", "keylstCCCIn2");

                    break;
                    default:
                    
                    dataModel.setProperty("/val_lstCCCIn", "");
                    iconDWR.setBackgroundColor("");
                    iconDWR.setColor("");
                    break;
                }
                //Dates Security Threat levels
                dataModel.setProperty("/val_StlExpD0", MidCondData[0].data.results[0].Threatdt);
                dataModel.setProperty("/val_StlExpD1", MidCondData[0].data.results[0].Dthreatdt);

                dataModel.setProperty("/val_OtcMax", MidCondData[0].data.results[0].Otccomplx);
                dataModel.setProperty("/val_OtcMatch", MidCondData[0].data.results[0].Matchmw);
                
                dataModel.setProperty("/val_threatInf", rmrksData[0].data.results[0].Threatinf);
                dataModel.setProperty("/val_HY1", rmrksData[0].data.results[0].Hy1rating);
                dataModel.setProperty("/val_HY2", rmrksData[0].data.results[0].Hy2rating);
                dataModel.setProperty("/val_HY3", rmrksData[0].data.results[0].Hy3rating);
                dataModel.setProperty("/val_HY4", rmrksData[0].data.results[0].Hy4rating);
                dataModel.setProperty("/val_HY5", rmrksData[0].data.results[0].Hy5rating);
                dataModel.setProperty("/val_HY6", rmrksData[0].data.results[0].Hy6rating);
                //#endregion Security Threat Levels.


                dataModel.setProperty("/val_wcd_table", wcdData[0].data.results);
                dataModel.setProperty("/val_plntt", plantData[0].data.results);
                dataModel.setProperty("/val_ORI_Intk1", MidCondData[0].data.results[0].Intake1);
                dataModel.setProperty("/val_ORI_Intk2", MidCondData[0].data.results[0].Intake2);
                dataModel.setProperty("/val_Oswrem", rmrksData[0].data.results[0].Osw);
                dataModel.setProperty("/val_HyattPlant", rmrksData[0].data.results[0].Hyattltkey);
                dataModel.setProperty("/val_ThermalitoPlant", rmrksData[0].data.results[0].Thplltkey);
                dataModel.setProperty("/val_Thermalitodivision", rmrksData[0].data.results[0].Thdvltkey);
                //Flood control max storage
                obj = oView.byId("ipt_FloodElev");
                dataModel.setProperty("/val_FloodElev", ctrllr.InitialFormat(obj.data().digitsallowed,
                    obj.data().error, obj.data().decAllwd, obj.data().name, obj.data().val, "",
                    MidCondData[0].data.results[0].Maxelev));
                 
                obj = oView.byId("ipt_Floodstor");
                dataModel.setProperty("/val_FloodStorage", ctrllr.InitialFormat(obj.data().digitsallowed,
                obj.data().error, obj.data().decAllwd, obj.data().name, obj.data().val, "",
                MidCondData[0].data.results[0].Maxaf));   

                obj = oView.byId("ipt_pool_lke");
                dataModel.setProperty("/val_PoolLake", ctrllr.InitialFormat(obj.data().digitsallowed,
                obj.data().error, obj.data().decAllwd, obj.data().name, obj.data().val, "",
                MidCondData[0].data.results[0].Lkelev));  

                obj = oView.byId("ipt_PoolThFor");
                dataModel.setProperty("/val_PoolThFore", ctrllr.InitialFormat(obj.data().digitsallowed,
                obj.data().error, obj.data().decAllwd, obj.data().name, obj.data().val, "",
                MidCondData[0].data.results[0].Thfbelev));  

                obj = oView.byId("ipt_pool_Tdd");
                dataModel.setProperty("/val_PoolTdd", ctrllr.InitialFormat(obj.data().digitsallowed,
                obj.data().error, obj.data().decAllwd, obj.data().name, obj.data().val, "",
                MidCondData[0].data.results[0].Tddelev));

                //obj = oView.byId("ipt_pool_Tdd");
                //dataModel.setProperty("/val_PoolThAftr", ctrllr.InitialFormat(obj.data().digitsallowed,
                //obj.data().error, obj.data().decAllwd, obj.data().name, obj.data().val, "",
                //MidCondData[0].data.results[0].Thabelev));

                obj = oView.byId("ipt_PoolAfB");
                dataModel.setProperty("/val_PoolThAftr", ctrllr.InitialFormat(obj.data().digitsallowed,
                obj.data().error, obj.data().decAllwd, obj.data().name, obj.data().val, "",
                MidCondData[0].data.results[0].Thabelev));

                //dataModel.setProperty("/val_CwrOrSp", MidCondData[0].data.results[0].Cxorspill);
                //dataModel.setProperty("/val_CwrPalermo", MidCondData[0].data.results[0].Cxpalermo);
                //dataModel.setProperty("/val_CwrThB", MidCondData[0].data.results[0].Cxthbypass);
                //dataModel.setProperty("/val_CwrThDi", MidCondData[0].data.results[0].Cxthdvdam);
                //dataModel.setProperty("/val_CwrRivOut", MidCondData[0].data.results[0].Cxrvrout);
                //dataModel.setProperty("/val_CwrSutBu", MidCondData[0].data.results[0].Cxsbcanal);
                //dataModel.setProperty("/val_CwrWeLa", MidCondData[0].data.results[0].Cxwestlat);
                //dataModel.setProperty("/val_CwrRichC", MidCondData[0].data.results[0].Cxrchcanal);
                //dataModel.setProperty("/val_CwrWestMain", MidCondData[0].data.results[0].Cxwstcanal);
                
                 //OR SPILLWAY
                obj = oView.byId("ipt_CwrOR");
                dataModel.setProperty("/val_CwrOrSp", ctrllr.InitialFormat(obj.data().digitsallowed,
                obj.data().error, obj.data().decAllwd, obj.data().name, obj.data().val, "",
                MidCondData[0].data.results[0].Cxorspill));
                   //OR PALERMO
                obj = oView.byId("ipt_CwrPalermo");
                dataModel.setProperty("/val_CwrPalermo", ctrllr.InitialFormat(obj.data().digitsallowed,
                obj.data().error, obj.data().decAllwd, obj.data().name, obj.data().val, "",
                MidCondData[0].data.results[0].Cxpalermo));
                  //TH BYPASS GATE
                obj = oView.byId("ipt_CwrThByp");
                dataModel.setProperty("/val_CwrThB", ctrllr.InitialFormat(obj.data().digitsallowed,
                obj.data().error, obj.data().decAllwd, obj.data().name, obj.data().val, "",
                MidCondData[0].data.results[0].Cxthbypass));
                  //TH DIV DAM
                obj = oView.byId("ipt_CwrThDiv");
                dataModel.setProperty("/val_CwrThDi", ctrllr.InitialFormat(obj.data().digitsallowed,
                obj.data().error, obj.data().decAllwd, obj.data().name, obj.data().val, "",
                MidCondData[0].data.results[0].Cxthdvdam));
                  //RIVER OUTLET
                obj = oView.byId("ipt_CwrRivOut");
                dataModel.setProperty("/val_CwrRivOut", ctrllr.InitialFormat(obj.data().digitsallowed,
                obj.data().error, obj.data().decAllwd, obj.data().name, obj.data().val, "",
                MidCondData[0].data.results[0].Cxrvrout));
                //RIVER OUTLET
                obj = oView.byId("ipt_CwrSutB");
                dataModel.setProperty("/val_CwrSutBu", ctrllr.InitialFormat(obj.data().digitsallowed,
                obj.data().error, obj.data().decAllwd, obj.data().name, obj.data().val, "",
                MidCondData[0].data.results[0].Cxsbcanal));

                //RIVER OUTLET
                obj = oView.byId("ipt_CwrWestLa");            
                dataModel.setProperty("/val_CwrWeLa", ctrllr.InitialFormat(obj.data().digitsallowed,
                obj.data().error, obj.data().decAllwd, obj.data().name, obj.data().val, "",
                MidCondData[0].data.results[0].Cxwestlat));
                 //RIVER OUTLET
                obj = oView.byId("ipt_CwrRich");  
                dataModel.setProperty("/val_CwrRichC", ctrllr.InitialFormat(obj.data().digitsallowed,
                obj.data().error, obj.data().decAllwd, obj.data().name, obj.data().val, "",
                MidCondData[0].data.results[0].Cxrchcanal));
                 //western main canal
                obj = oView.byId("ipt_CwrWestM");
                dataModel.setProperty("/val_CwrWestMain", ctrllr.InitialFormat(obj.data().digitsallowed,
                obj.data().error, obj.data().decAllwd, obj.data().name, obj.data().val, "",
                MidCondData[0].data.results[0].Cxwstcanal));


                //aaaaaaaaaaaaaaaaaaaaaa
             
                var CwrRivOut = Number(this.delcomma(dataModel.oData.val_CwrRivOut));
                
                var CwrWeLa = Number(this.delcomma(dataModel.oData.val_CwrWeLa));
                var CwrRichC = Number(this.delcomma(dataModel.oData.val_CwrRichC));
                var CwrWestMain = Number(this.delcomma(dataModel.oData.val_CwrWestMain)); 
                var CwrThDiv = Number(this.delcomma(dataModel.oData.val_CwrThDi)); 
                var CwrSutBut = Number(this.delcomma(dataModel.oData.val_CwrSutBu)); 
                //var CwrTotalRivr = Number(this.delcomma(dataModel.oData.val_CwrTotalRivr)); 
                var CwrTotalRivr = CwrThDiv + CwrRivOut;

                var objTotalRiv = this.getDecAll(oView.byId("ipt_CwrTotalThAftrb"));
                var formated = this.getFormat(objTotalRiv,"");
            
                var sumaftb = CwrRivOut + CwrSutBut + CwrWeLa + CwrRichC +CwrWestMain;
                var sumtotalriver = CwrRivOut + CwrThDiv;
   
                obj = oView.byId("ipt_CwrTotalThAftrb");
                dataModel.setProperty("/val_CwrTotalThAftrb", ctrllr.InitialFormat(obj.data().digitsallowed,
                obj.data().error, obj.data().decAllwd, obj.data().name, obj.data().val, "",sumaftb.toString()));

                obj = oView.byId("ipt_CwrTotalRivr");
                dataModel.setProperty("/val_CwrTotalRivr", ctrllr.InitialFormat(obj.data().digitsallowed,
                obj.data().error, obj.data().decAllwd, obj.data().name, obj.data().val, "",sumtotalriver.toString()));


                //dataModel.setProperty("/val_CwrTotalRivr",(Number(dataModel.oData.val_CwrThDi)+Number(dataModel.oData.val_CwrRivOut)));
                
               // dataModel.setProperty("/val_CwrTotalThAftrb",(Number(dataModel.oData.val_CwrRivOut)+Number(dataModel.oData.val_CwrTotalRivr)+Number(dataModel.oData.val_CwrWeLa)+
                //Number(dataModel.oData.val_CwrRichC)+Number(dataModel.oData.val_CwrWestMain)));
                    
                   
                 





                return dataModel;
                //#endregion Security Threat Levels.

                
            },
            
            /**Se dispara con el evento liveChange, Para validar input solo números, limitado a 5 dígitos, separador de miles = "," */
             OnLiveChgEvt: function (evt) {

                //Para obtener los parámetros enviados en el eventhandler(evt), esto nos servirá para
                //Crear el objeto formateador
                var dig = evt.getSource().data("digitsallowed");     //Número de dígitos permitidos
                var id = evt.getSource().data("error");              //Texto identificador del mensaje de error
                var decAllwd = evt.getSource().data("decAllwd");     //Número de decimales permitidos
                var obj_name = evt.getSource().data("name");         //Nombre del objeto que dispara el evento
                var obj_valId = evt.getSource().data("val");         //Nombre de la variable que contiene el valor
                var sign_allwd = evt.getSource().data("sign");       //Indica que el campo acepta signos + o -
                var flag_dec = "";                                   //Flag para saber si contiene decimales
                var sign = "";                                       //Para considerar signos.
                //#region Variables para calculo de diferencia
                var prevDaySchAllaf = 0;
                var prevday = 0;
                var dif = 0;
                var dif_val = 0;
                var netValInt = 0;
                var netValDec = 0;
                var flag = "";
                var values;
                //#endregion
                //------------------------------------

                //Se crea un objeto de tipo formateador, el cual sirve para aplicar el formato requerido al objeto
                var oNumberFormat = sap.ui.core.format.NumberFormat.getFloatInstance({
                    //Número de decimales permitidos, en este caso solo queremos números enteros
                    maxFractionDigits: decAllwd,
                    //Se agrupan los números, en este caso de 3 en 3
                    groupingEnabled: true,
                    //Separados de grupos
                    groupingSeparator: ",",
                    //Separador para decimales
                    decimalSeparator: ".",
                    //Número máximo de dígitos permitidos
                    maxIntegerDigits: dig
                });

                //-------------------------------------------

                //Se crea el modelo json que nos servirá para recuperar y mandar valores a los objetos de la vista
                //Se obtiene la vista, lo cual nos da acceso a todos los componentes en ella.
                var vistaOnChange = this.getView("View1");
                //var oJSONModel = new sap.ui.model.json.JSONModel();
                var Modelo_vista = vistaOnChange.getModel();
                var json_datos = Modelo_vista.getData();

                //Se obtiene la fuente (objeto) que disparó el evento y a continuación el valor de dicho objeto
                var value = evt.getSource().getValue();
                Modelo_vista.setData(null);

                //if (typeof IntDec === "undefined") {
                //Esto sirve para saber si una variables ya esta definida
                //}

                //----------------------------
                if ((value.substring(0, 1).includes("+") || value.substring(0, 1).includes("-")) && sign_allwd === "X") {
                    switch (value.substring(0, 1)) {
                        //case "+":
                        //  sign = "+";
                        //break;
                        case "-":
                            sign = "-";
                            break;
                        default:
                            break;
                    }

                }
                //Verificamos si el valor contiene . decimal
                if (value.includes(".")) {
                    //Si se encontró el . decimal entonces separamos enteros de decimales en un array
                    var IntDec = value.split('.');

                    //Nos aseguramos de que solo existan dígitos tanto en los enteros como en los decimales
                    var netvalueint = IntDec[0].replace(/[^\d]/g, "");//Regex muy simple si encuentra "," en cualquier parte del valor, lo reemplaza o en este caso lo elimina.
                    // if(decAllwd !=""){
                    var netvaluedec = IntDec[1].replace(/[^\d]/g, "");
                    flag_dec = "X";
                    //}
                    //else{

                    //   var msgerror = "The maximum allowed limit for " + id + " is a " + dig +
                    // " digit number." + "\n\r Please enter a proper value.";
                    //json_datos[obj_valId] = "";
                    //format_value = ""; //oNumberFormat.format(netvalueint);
                    //sap.m.MessageBox.error(msgerror);
                    //}

                }
                //Si no se encuentra . decimale entonces tomamos el valor enviado por el usuario
                else {
                    //Nos aseguramos de que solo existan dígitos
                    var value = value.replace(/[^\d]/g, "");//Regex muy simple si encuentra "," en cualquier parte del valor, lo reemplaza o en este caso lo elimina.
                    flag_dec = "";
                }
                if ((flag_dec === "X" && decAllwd != "") || flag_dec === "") {



                    //---------------------------------

                    //Verificamos que los enteros no excedan el valor indicado de digitos permitidos ()
                    //Se verifica si la variante netvaluint esta definida(se encontró . decimal y se realizó el split)
                    if (typeof netvalueint !== "undefined") {
                        // Si esta definida hay punto decimal y por l tanto usamos el valor recuperado de la vista
                        if (netvalueint.length > dig) {
                            //Si se sobrepaso el número de dígitos permitidos se lanza msg de error.
                            if (decAllwd > 0) {
                                if (decAllwd === "1") {
                                    var msgerror = "The maximum allowed limit for " + id + " is a " + dig +
                                        " digit number with " + decAllwd + " decimal place." + "\n\r Please enter a proper value.";
                                    json_datos[obj_valId] = "";

                                    format_value = "";
                                }
                                else {
                                    var msgerror = "The maximum allowed limit for " + id + " is a " + dig +
                                        " digit number with " + decAllwd + " decimal places." + "\n\r Please enter a proper value.";
                                    json_datos[obj_valId] = "";

                                    format_value = "";
                                }

                                //values = this.number_val(json_datos.val_CliftCourt_PrevDayDivAllot, flag);// [flag,int,dec]
                                //this.dif_cal(json_datos, flag, prevday, prevDaySchAllaf, dif_val,values, netValInt, netValDec,oNumberFormat, dif)


                                //Modelo_vista.setData(json_datos);//se envía el objeto json al modelo json creado previamente
                                //Modelo_vista.updateBindings(true);
                                //vistaOnChange.setModel(Modelo_vista);//Se modifican los datos de la vista por medio del modelo json.
                            }
                            else {
                                var msgerror = "The maximum allowed limit for " + id + " is a " + dig +
                                    " digit number." + "\n\r Please enter a proper value.";
                                json_datos[obj_valId] = "";
                                format_value = "";
                                //values = this.number_val(json_datos.val_CliftCourt_PrevDayDivAllot, flag);// [flag,int,dec]
                                //this.dif_cal(json_datos, flag, prevday, prevDaySchAllaf, dif_val,values, netValInt, netValDec,oNumberFormat, dif)

                                //Modelo_vista.setData(json_datos);//se envía el objeto json al modelo json creado previamente
                                //Modelo_vista.updateBindings(true);
                                //vistaOnChange.setModel(Modelo_vista);//Se modifican los datos de la vista por medio del modelo json.
                            }
                            sap.m.MessageBox.error(msgerror);
                        }
                        else {
                            //Verificamos que la variable contenga valores, en este punto deberian ser dígitos o null o podría ser "" por q se ingresó
                            //un . decimal como primer caracter
                            if (netvalueint !== null & netvalueint !== "") {

                                //Verificamos si existen valores en la parte decimal
                                if ((netvaluedec !== null && netvaluedec !== "" && netvaluedec !== undefined)) {
                                    //Si hay decimales se concatenan a los enteros y se formatea
                                    value = netvalueint + '.' + netvaluedec;
                                    var format_value = sign + oNumberFormat.format(value);
                                }
                                else {
                                    //Si no hay decimales se formatean solo los enteros

                                    var format_value = oNumberFormat.format(netvalueint);
                                    //Se agrega el punto decimal 
                                    if (decAllwd != "") {
                                        format_value = sign + format_value + ".";
                                    }
                                    else {
                                        format_value = sign + format_value;
                                    }

                                }
                            }
                            else {
                                //No se encontraron valores enteros
                                //Se verifica si hay valores decimales
                                if (netvaluedec !== null & netvaluedec !== "") {
                                    value = '.' + netvaluedec;
                                    var format_value = sign + oNumberFormat.format(value);
                                }
                                else {
                                    // no hay decimales, se devuelve el punto decimal.
                                    var format_value = sign + '.';
                                }
                            }
                        }
                    }
                    //Si no se realizó el split se usa el valor recuperado de la vista (value)
                    else {
                        if (value.length > dig) {
                            //Si se sobrepaso el número de dígitos permitidos se lanza msg de error.
                            if (decAllwd > 0) {
                                if (decAllwd === "1") {
                                    var msgerror = "The maximum allowed limit for " + id + " is a " + dig +
                                        " digit number with " + decAllwd + " decimal place." + "\n\r Please enter a proper value.";
                                    json_datos[obj_valId] = "";

                                    format_value = "";
                                }
                                else {
                                    var msgerror = "The maximum allowed limit for " + id + " is a " + dig +
                                        " digit number with " + decAllwd + " decimal places." + "\n\r Please enter a proper value.";
                                    json_datos[obj_valId] = "";

                                    format_value = "";
                                }

                                //values = this.number_val(json_datos.val_CliftCourt_PrevDayDivAllot, flag);// [flag,int,dec]
                                //this.dif_cal(json_datos, flag, prevday, prevDaySchAllaf, dif_val,values, netValInt, netValDec,oNumberFormat, dif)


                                //Modelo_vista.setData(json_datos);//se envía el objeto json al modelo json creado previamente
                                //Modelo_vista.updateBindings(true);
                                //vistaOnChange.setModel(Modelo_vista);//Se modifican los datos de la vista por medio del modelo json.
                            }
                            else {
                                var msgerror = "The maximum allowed limit for " + id + " is a " + dig +
                                    " digit number. " + "\n\r Please enter a proper value.";
                                json_datos[obj_valId] = "";
                                format_value = "";
                                // values = this.number_val(json_datos.val_CliftCourt_PrevDayDivAllot, flag);// [flag,int,dec]
                                //this.dif_cal(json_datos, flag, prevday, prevDaySchAllaf, dif_val,values, netValInt, netValDec,oNumberFormat, dif)

                                //Modelo_vista.setData(json_datos);//se envía el objeto json al modelo json creado previamente
                                //Modelo_vista.updateBindings(true);
                                //vistaOnChange.setModel(Modelo_vista);//Se modifican los datos de la vista por medio del modelo json.
                            }
                            sap.m.MessageBox.error(msgerror);
                        }
                        else {
                            if (value !== "") {
                                var format_value = sign + oNumberFormat.format(value);
                            }
                            else {
                                var format_value = sign + "";
                            }

                        }
                    }
                }
                else {
                    var msgerror = "The maximum allowed limit for " + id + " is a " + dig +
                        " digit number." + "\n\r Please enter a proper value.";
                    json_datos[obj_valId] = "";
                    format_value = ""; //oNumberFormat.format(netvalueint);
                    sap.m.MessageBox.error(msgerror);
                }

                //Se crea el objeto json que contiene los objetos que necesitamos modificar 

                //oJSONModel.getProperty("/cbx_secThr_Lvl_class");
                //oJSONModel.setProperty("/cbx_secThr_Lvl_class","cbx_green");
                //oModel.setData(modelData);

                // oJSONModel.setData(oJSON);//se envía el objeto json al modelo json creado previamente
                //oView.setModel(oJSONModel);//Se modifican los datos de la vista por medio del modelo json. 

                json_datos[obj_valId] = format_value;

                if (obj_name === "ipt_CwrThDiv" || obj_name === "ipt_CwrRivOut") {
    
                   var CwrThDiv = Number(this.delcomma(json_datos["val_CwrThDi"]));
                   var CwrRivOut = Number(this.delcomma(json_datos["val_CwrRivOut"]));
                   
                   var objTotalRiv = this.getDecAll(vistaOnChange.byId("ipt_CwrTotalRivr"));
                   var formated = this.getFormat(objTotalRiv,"");
                   json_datos["val_CwrTotalRivr"] = formated.format(CwrThDiv + CwrRivOut);
                  
                }

                if (obj_name === "ipt_CwrRivOut" ||  obj_name === "ipt_CwrWestLa" ||  obj_name === "ipt_CwrSutB" || obj_name === "ipt_CwrRich"
                || obj_name === "ipt_CwrWestM" || obj_name === "ipt_CwrThDiv" ) {
                    
    
                    var CwrRivOut = Number(this.delcomma(json_datos["val_CwrRivOut"]));
                    var CwrTotalRivr = Number(this.delcomma(json_datos["val_CwrTotalRivr"]));
                    var CwrWeLa = Number(this.delcomma(json_datos["val_CwrWeLa"]));
                    var CwrRichC = Number(this.delcomma(json_datos["val_CwrRichC"]));
                    var CwrWestMain = Number(this.delcomma(json_datos["val_CwrWestMain"]));
                    var CwrSutBut = Number(this.delcomma(json_datos["val_CwrSutBu"]));
                    

                    var objTotalRiv = this.getDecAll(vistaOnChange.byId("ipt_CwrTotalThAftrb"));
                    var formated = this.getFormat(objTotalRiv,"");

                    json_datos["val_CwrTotalThAftrb"] = formated.format(CwrRivOut + CwrSutBut + CwrWeLa + CwrRichC +CwrWestMain);
                   
                 }
                //Cuando se modifique el valor del campo Prev. Day Scheduled Allotment, se calcula el valor del campo
                //Prev. Day Scheduled AllotmentAF
                if (obj_name === "ipt_CliftCourt4_PrevDay_SA") {
                    //Se crea un objeto de tipo formateador, el cual sirve para aplicar el formato requerido al objeto
                    var oNumberFormat1 = sap.ui.core.format.NumberFormat.getFloatInstance({
                        //Número de decimales permitidos, en este caso solo queremos números enteros
                        maxFractionDigits: 0,
                        //Se agrupan los números, en este caso de 3 en 3
                        groupingEnabled: true,
                        //Separados de grupos
                        groupingSeparator: ",",
                        //Separador para decimales
                        decimalSeparator: "",
                        //Número máximo de dígitos permitidos
                        maxIntegerDigits: 6,
                        //roundingMode: "TOWARDS_ZERO"
                    });
                    var valClifCrtAf = json_datos[obj_valId].replace(/,/g, "");
                    
                    var calc = (Number(valClifCrtAf) * 1.9835).toString();
                    var PdIntDec = "";
                    if (calc.includes(".")) {
                        PdIntDec = calc.split('.');
                        json_datos.val_CliftCourt_af = oNumberFormat1.format(PdIntDec[0]);
                    }
                    else {
                        json_datos.val_CliftCourt_af = oNumberFormat1.format(calc);
                    }
                    //json_datos.val_CliftCourt_af = oNumberFormat1.format(calc);
                    //json_datos.val_CliftCourt_af = Math.round(calc);
                    //json_datos.val_CliftCourt_af = json_datos.val_CliftCourt_af.toString();

                    values = this.number_val(json_datos.val_CliftCourt_PrevDayDivAllot, flag);// [flag,int,dec]
                    this.dif_cal(json_datos, flag, prevday, prevDaySchAllaf, dif_val, values, netValInt, netValDec, oNumberFormat, dif)

                }
                if (obj_name === "ipt_DvppArrMtr" || obj_name === "ipt_DvppRelInAq") {
                    var oNumberFormatDvpp = sap.ui.core.format.NumberFormat.getFloatInstance({
                        //Número máximo de dígitos permitidos
                        maxIntegerDigits: 9,
                        //Número de decimales permitidos, en este caso solo queremos números enteros
                        maxFractionDigits: 0,
                        //Se agrupan los números, en este caso de 3 en 3
                        groupingEnabled: true,
                        //Separados de grupos
                        groupingSeparator: ",",
                        //Separador para decimales
                        decimalSeparator: "",

                    });
                    var ArrMtr = Number(json_datos.val_dvpp_arrMtr);
                    var Devria = Number(json_datos.val_dvpp_relIntoAqu);

                    if (ArrMtr > 0) {
                        var total = ArrMtr + Devria;
                        json_datos.val_sbpp_aquedBlend = oNumberFormatDvpp.format((ArrMtr * 100) / (ArrMtr + Devria).toString());
                    }
                    var aqBlend = 100 - Number(json_datos.val_sbpp_aquedBlend);
                    json_datos.val_sbpp_dvRes = oNumberFormatDvpp.format(aqBlend.toString());

                }




                // }


                //oJSON.obj_valId = format_value;
                //oJSONModel.setProperty(obj_valId, format_value);
                Modelo_vista.setData(json_datos);//se envía el objeto json al modelo json creado previamente
                Modelo_vista.updateBindings(true);
                vistaOnChange.setModel(Modelo_vista);//Se modifican los datos de la vista por medio del modelo json.
            },

            number_val: function (val, flag, int, dec) {
                //Verificamos si el valor contiene . decimal
                if (val.includes(".")) {
                    //Si se encontró el . decimal entonces separamos enteros de decimales en un array
                    var IntDec = val.split('.');

                    //Nos aseguramos de que solo existan dígitos tanto en los enteros como en los decimales
                    int = IntDec[0].replace(/[^\d]/g, "");//Regex muy simple si encuentra "," en cualquier parte del valor, lo reemplaza o en este caso lo elimina.
                    dec = IntDec[1].replace(/[^\d]/g, "");
                    flag = "X";
                }
                //Si no se encuentra . decimale entonces tomamos el valor enviado por el usuario
                else {
                    //Nos aseguramos de que solo existan dígitos
                    int = val.replace(/[^\d]/g, "");//Regex muy simple si encuentra "," en cualquier parte del valor, lo reemplaza o en este caso lo elimina.
                    dec = "";
                    flag = "";
                }
                return [flag, int, dec];

            },
            delcomma: function (val) {
                var value = val;
                value = value.replace(/[^\d \+ \- \.]/g, "");

                return value
            },

            getDecAll: function (Object) {
                var param = Object.getCustomData();
                var decAll = 0;
                for (let index = 0; index < param.length; index++) {
                    const element = param[index];
                    if (element.getProperty("key") === "digitsallowed") {
                        decAll = Number(element.getProperty("value"));
                        break;
                    }
                }
                return decAll;
            },

            getFormat: function(dig,dec){
                //Se crea un objeto de tipo formateador, el cual sirve para aplicar el formato requerido al objeto
                var oNumberFormat = sap.ui.core.format.NumberFormat.getFloatInstance({
                    //Número de decimales permitidos, en este caso solo queremos números enteros
                    maxFractionDigits: dec,
                    //Se agrupan los números, en este caso de 3 en 3
                    groupingEnabled: true,
                    //Separados de grupos
                    groupingSeparator: ",",
                    //Separador para decimales
                    decimalSeparator: ".",
                    //Número máximo de dígitos permitidos
                    maxIntegerDigits: dig
                });

                return oNumberFormat;



            },

              InitialFormat: function (digAll, err, decall, name, val, psign, pValue) { 

 

                                //Para obtener los parámetros enviados en el eventhandler(evt), esto nos servirá para 
                
                                //Crear el objeto formateador 
                
                                var dig = digAll;     //Número de dígitos permitidos 
                
                                var id = err;              //Texto identificador del mensaje de error 
                
                                var decAllwd = decall;     //Número de decimales permitidos 
                
                                var obj_name = name;         //Nombre del objeto que dispara el evento 
                
                                var obj_valId = val;         //Nombre de la variable que contiene el valor 
                
                                var sign_allwd = psign;       //Indica que el campo acepta signos + o - 
                
                                var flag_dec = "";                                   //Flag para saber si contiene decimales 
                
                                var sign = "";                                       //Para considerar signos. 
                
                                //#region Variables para calculo de diferencia 
                
                                var prevDaySchAllaf = 0; 
                
                                var prevday = 0; 
                
                                var dif = 0; 
                
                                var dif_val = 0; 
                
                                var netValInt = 0; 
                
                                var netValDec = 0; 
                
                                var flag = ""; 
                
                                var values; 
                
                                //#endregion 
                
                                //------------------------------------ 
                
                 
                
                                //Se crea un objeto de tipo formateador, el cual sirve para aplicar el formato requerido al objeto 
                
                                var oNumberFormat = sap.ui.core.format.NumberFormat.getFloatInstance({ 
                
                                    //Número de decimales permitidos, en este caso solo queremos números enteros 
                
                                    maxFractionDigits: decAllwd, 
                
                                    //Se agrupan los números, en este caso de 3 en 3 
                
                                    groupingEnabled: true, 
                
                                    //Separados de grupos 
                
                                    groupingSeparator: ",", 
                
                                    //Separador para decimales 
                
                                    decimalSeparator: ".", 
                
                                    //Número máximo de dígitos permitidos 
                
                                    maxIntegerDigits: dig 
                
                                }); 
                
                 
                
                                //------------------------------------------- 
                
                 
                
                                //Se crea el modelo json que nos servirá para recuperar y mandar valores a los objetos de la vista 
                
                                //Se obtiene la vista, lo cual nos da acceso a todos los componentes en ella. 
                
                                var vistaOnChange = this.getView("Index"); 
                
                                //var oJSONModel = new sap.ui.model.json.JSONModel(); 
                
                                var Modelo_vista = vistaOnChange.getModel(); 
                
                                //var json_datos = Modelo_vista.getData(); 
                
                                var oJSON = {}; 
                
                 
                
                                //Se obtiene la fuente (objeto) que disparó el evento y a continuación el valor de dicho objeto 
                
                                var value = pValue //vistaOnChange.byId([obj_name]).getValue(); 
                
                                //Modelo_vista.setData(null); 
                
                 
                
                                //if (typeof IntDec === "undefined") { 
                
                                //Esto sirve para saber si una variables ya esta definida 
                
                                //} 
                
                 
                
                                //---------------------------- 
                
                                if ((value.substring(0, 1).includes("+") || value.substring(0, 1).includes("-")) && sign_allwd === "X") { 
                
                                    switch (value.substring(0, 1)) { 
                
                                        case "+": 
                
                                            sign = "+"; 
                
                                            break; 
                
                                        case "-": 
                
                                            sign = "-"; 
                
                                            break; 
                
                                        default: 
                
                                            break; 
                
                                    } 
                
                 
                
                                } 
                
                                //Verificamos si el valor contiene . decimal 
                
                                if (value.includes(".")) { 
                
                                    //Si se encontró el . decimal entonces separamos enteros de decimales en un array 
                
                                    var IntDec = value.split('.'); 
                
                 
                
                                    //Nos aseguramos de que solo existan dígitos tanto en los enteros como en los decimales 
                
                                    var netvalueint = IntDec[0].replace(/[^\d]/g, "");//Regex muy simple si encuentra "," en cualquier parte del valor, lo reemplaza o en este caso lo elimina. 
                
                                    var netvaluedec = IntDec[1].replace(/[^\d]/g, ""); 
                
                                    flag_dec = "X"; 
                
                                } 
                
                                //Si no se encuentra . decimale entonces tomamos el valor enviado por el usuario 
                
                                else { 
                
                                    //Nos aseguramos de que solo existan dígitos 
                
                                    var value = value.replace(/[^\d]/g, "");//Regex muy simple si encuentra "," en cualquier parte del valor, lo reemplaza o en este caso lo elimina. 
                
                                    flag_dec = ""; 
                
                                } 
                
                 
                
                                //--------------------------------- 
                
                 
                
                                //Verificamos que los enteros no excedan el valor indicado de digitos permitidos () 
                
                                //Se verifica si la variante netvaluint esta definida(se encontró . decimal y se realizó el split) 
                
                                if (typeof netvalueint !== "undefined") { 
                
                                    // Si esta definida hay punto decimal y por l tanto usamos el valor recuperado de la vista 
                
                                    if (netvalueint.length > dig) { 
                
                                        //Si se sobrepaso el número de dígitos permitidos se lanza msg de error. 
                
                                        if (decAllwd > 0) { 
                
                                            var msgerror = "The maximum allowed limit for " + id + " is a " + dig + 
                
                                                " digit number with " + decAllwd + " decimal places." + "\n\r Please enter a proper value."; 
                
                                            oJSON[obj_valId] = "0"; 
                
                 
                
                                            format_value = "0"; 
                
                                            //values = this.number_val(json_datos.val_CliftCourt_PrevDayDivAllot, flag);// [flag,int,dec] 
                
                                            //this.dif_cal(json_datos, flag, prevday, prevDaySchAllaf, dif_val,values, netValInt, netValDec,oNumberFormat, dif) 
                
                 
                
                                            //Modelo_vista.setData(json_datos);//se envía el objeto json al modelo json creado previamente 
                
                                            //Modelo_vista.updateBindings(true); 
                
                                            //vistaOnChange.setModel(Modelo_vista);//Se modifican los datos de la vista por medio del modelo json. 
                
                                        } 
                
                                        else { 
                
                                            var msgerror = "The maximum allowed limit for " + id + " is a " + dig + 
                
                                                " digit number." + "\n\r Please enter a proper value."; 
                
                                            oJSON[obj_valId] = "0"; 
                
                                            format_value = "0"; 
                
                                            //values = this.number_val(json_datos.val_CliftCourt_PrevDayDivAllot, flag);// [flag,int,dec] 
                
                                            //this.dif_cal(json_datos, flag, prevday, prevDaySchAllaf, dif_val,values, netValInt, netValDec,oNumberFormat, dif) 
                
                 
                
                                            //Modelo_vista.setData(json_datos);//se envía el objeto json al modelo json creado previamente 
                
                                            //Modelo_vista.updateBindings(true); 
                
                                            //vistaOnChange.setModel(Modelo_vista);//Se modifican los datos de la vista por medio del modelo json. 
                
                                        } 
                
                                        sap.m.MessageBox.error(msgerror); 
                
                                    } 
                
                                    else { 
                
                                        //Verificamos que la variable contenga valores, en este punto deberian ser dígitos o null o podría ser "" por q se ingresó 
                
                                        //un . decimal como primer caracter 
                
                                        if (netvalueint !== null & netvalueint !== "") { 
                
                 
                
                                            //Verificamos si existen valores en la parte decimal 
                
                                            if (netvaluedec !== null & netvaluedec !== "") { 
                
                                                //Si hay decimales se concatenan a los enteros y se formatea 
                
                                                value = netvalueint + '.' + netvaluedec; 
                
                                                var format_value = sign + oNumberFormat.format(value); 
                
                                            } 
                
                                            else { 
                
                                                //Si no hay decimales se formatean solo los enteros 
                
                 
                
                                                var format_value = oNumberFormat.format(netvalueint); 
                
                                                //Se agrega el punto decimal  
                
                                                format_value = sign + format_value + '.'; 
                
                                            } 
                
                                        } 
                
                                        else { 
                
                                            //No se encontraron valores enteros 
                
                                            //Se verifica si hay valores decimales 
                
                                            if (netvaluedec !== null & netvaluedec !== "") { 
                
                                                value = '.' + netvaluedec; 
                
                                                var format_value = sign + oNumberFormat.format(value); 
                
                                            } 
                
                                            else { 
                
                                                // no hay decimales, se devuelve el punto decimal. 
                
                                                var format_value = sign + '.'; 
                
                                            } 
                
                                        } 
                
                                    } 
                
                                } 
                
                                //Si no se realizó el split se usa el valor recuperado de la vista (value) 
                
                                else { 
                
                                    if (value.length > dig) { 
                
                                        //Si se sobrepaso el número de dígitos permitidos se lanza msg de error. 
                
                                        if (decAllwd > 0) { 
                
                                            var msgerror = "The maximum allowed limit for " + id + " is a " + dig + 
                
                                                " digit number with " + decAllwd + " decimal places." + "\n\r Please enter a proper value."; 
                
                                            oJSON[obj_valId] = "0"; 
                
                                            format_value = "0"; 
                
                                            //values = this.number_val(json_datos.val_CliftCourt_PrevDayDivAllot, flag);// [flag,int,dec] 
                
                                            //this.dif_cal(json_datos, flag, prevday, prevDaySchAllaf, dif_val,values, netValInt, netValDec,oNumberFormat, dif) 
                
                 
                
                                            //Modelo_vista.setData(json_datos);//se envía el objeto json al modelo json creado previamente 
                
                                            //Modelo_vista.updateBindings(true); 
                
                                            //vistaOnChange.setModel(Modelo_vista);//Se modifican los datos de la vista por medio del modelo json. 
                
                                        } 
                
                                        else { 
                
                                            var msgerror = "The maximum allowed limit for " + id + " is a " + dig + 
                
                                                " digit number. " + "\n\r Please enter a proper value."; 
                
                                            oJSON[obj_valId] = "0"; 
                
                                            format_value = "0"; 
                
                                            // values = this.number_val(json_datos.val_CliftCourt_PrevDayDivAllot, flag);// [flag,int,dec] 
                
                                            //this.dif_cal(json_datos, flag, prevday, prevDaySchAllaf, dif_val,values, netValInt, netValDec,oNumberFormat, dif) 
                
                 
                
                                            //Modelo_vista.setData(json_datos);//se envía el objeto json al modelo json creado previamente 
                
                                            //Modelo_vista.updateBindings(true); 
                
                                            //vistaOnChange.setModel(Modelo_vista);//Se modifican los datos de la vista por medio del modelo json. 
                
                                        } 
                
                                        sap.m.MessageBox.error(msgerror); 
                
                                    } 
                
                                    else { 
                
                                        if (value !== "") { 
                
                                            var format_value = sign + oNumberFormat.format(value); 
                
                                        } 
                
                                        else { 
                
                                            var format_value = sign + ""; 
                
                                        } 
                
                 
                
                                    } 
                
                                } 
                
                 
                
                                //Se crea el objeto json que contiene los objetos que necesitamos modificar  
                
                 
                
                                //oJSONModel.getProperty("/cbx_secThr_Lvl_class"); 
                
                                //oJSONModel.setProperty("/cbx_secThr_Lvl_class","cbx_green"); 
                
                                //oModel.setData(modelData); 
                
                 
                
                                // oJSONModel.setData(oJSON);//se envía el objeto json al modelo json creado previamente 
                
                                //oView.setModel(oJSONModel);//Se modifican los datos de la vista por medio del modelo json.  
                
                 
                
                                oJSON[(obj_valId)] = format_value; 
                
                 
                
                                if (obj_name === "ipt_CliftCourt2_PrevDay_DA" || obj_name === "ipt_CliftCourt_PrevDay_SAAf") { 
                
                 
                
                                    //values = this.number_val(oJSON.val_CliftCourt_PrevDayDivAllot, flag);// [flag,int,dec] 
                
                                    //this.dif_cal(oJSON, flag, prevday, prevDaySchAllaf, dif_val, values, netValInt, netValDec, oNumberFormat, dif) 
                
                                } 
                
                                //Cuando se modifique el valor del campo Prev. Day Scheduled Allotment, se calcula el valor del campo 
                
                                //Prev. Day Scheduled AllotmentAF 
                
                                if (obj_name === "ipt_CliftCourt4_PrevDay_SA") { 
                
                                    //Se crea un objeto de tipo formateador, el cual sirve para aplicar el formato requerido al objeto 
                
                                    var oNumberFormat1 = sap.ui.core.format.NumberFormat.getFloatInstance({ 
                
                                        //Número de decimales permitidos, en este caso solo queremos números enteros 
                
                                        maxFractionDigits: 0, 
                
                                        //Se agrupan los números, en este caso de 3 en 3 
                
                                        groupingEnabled: true, 
                
                                        //Separados de grupos 
                
                                        groupingSeparator: ",", 
                
                                        //Separador para decimales 
                
                                        decimalSeparator: "", 
                
                                        //Número máximo de dígitos permitidos 
                
                                        maxIntegerDigits: 6, 
                
                                        //roundingMode: "TOWARDS_ZERO" 
                
                                    }); 
                
                                    //var calc = value * 1.9835; 
                
                                    //oJSON.val_CliftCourt_af = oNumberFormat1.format(calc); 
                
                                    //json_datos.val_CliftCourt_af = Math.round(calc); 
                
                                    //json_datos.val_CliftCourt_af = json_datos.val_CliftCourt_af.toString(); 
                
                 
                
                                    //values = this.number_val(oJSON.val_CliftCourt_PrevDayDivAllot, flag);// [flag,int,dec] 
                
                                    //this.dif_cal(oJSON, flag, prevday, prevDaySchAllaf, dif_val, values, netValInt, netValDec, oNumberFormat, dif) 
                
                 
                
                                } 
                
                                if (obj_name === "ipt_DvppArrMtr" || obj_name === "ipt_DvppRelInAq") { 
                
                                    var oNumberFormatDvpp = sap.ui.core.format.NumberFormat.getFloatInstance({ 
                
                                        //Número máximo de dígitos permitidos 
                
                                        maxIntegerDigits: 9, 
                
                                        //Número de decimales permitidos, en este caso solo queremos números enteros 
                
                                        maxFractionDigits: 0, 
                
                                        //Se agrupan los números, en este caso de 3 en 3 
                
                                        groupingEnabled: true, 
                
                                        //Separados de grupos 
                
                                        groupingSeparator: ",", 
                
                                        //Separador para decimales 
                
                                        decimalSeparator: "", 
                
                 
                
                                    }); 
                
                                    //var ArrMtr = Number(oJSON.val_dvpp_arrMtr); 
                
                                    //var Devria = Number(oJSON.val_dvpp_relIntoAqu); 
                
                 
                
                                    //if (ArrMtr > 0) { 
                
                                    //  var total = ArrMtr + Devria; 
                
                                    // oJSON.val_sbpp_aquedBlend = oNumberFormatDvpp.format((ArrMtr * 100) / (ArrMtr + Devria).toString()); 
                
                                    // } 
                
                                    //var aqBlend = 100 - Number(oJSON.val_sbpp_aquedBlend); 
                
                                    //oJSON.val_sbpp_dvRes = oNumberFormatDvpp.format(aqBlend.toString()); 
                
                 
                
                                } 
                
                 
                 
                 
                
                                // } 
                
                 
                
                                //oJSON.obj_valId = format_value; 
                
                                //oJSONModel.setProperty(obj_valId, format_value); 
                
                                //Modelo_vista.setData(json_datos);//se envía el objeto json al modelo json creado previamente 
                
                                //Modelo_vista.updateBindings(true); 
                
                                //vistaOnChange.setModel(Modelo_vista);//Se modifican los datos de la vista por medio del modelo json. 
                
                                return format_value; 
                
            }, 

            onSubmit: async function (UsrModel, data) {
                var oView = this.getView("View1");
                var oThat = this;
                MessageBox.confirm("Are you ready to submit?", {
                    view: oView,
                    that: oThat,
                    actions: [MessageBox.Action.OK, MessageBox.Action.CANCEL],
                    emphasizedAction: MessageBox.Action.OK,
                    onClose: async function (sAction) {
                        if (sAction === "OK") {
                            var PostMidNgthConUrl = "/sap/opu/odata/sap/ZODATA_MC_WROR_SRV/";
                           
                            var Service = new sap.ui.model.odata.ODataModel(PostMidNgthConUrl, true);
                            //var submitJson = this.view.getModel().getData();
                            var oView = this.that.getView("View1");
                            var submitJson = oView.getModel().getData();

                            //var oView = this.view;
                            var submitJsonRmrk = submitJson;


                            var now = new Date();
                            var oEntry = {};
                            oEntry.Mandt = submitJson.valMandt;
                            oEntry.Mcdate = submitJson.valMcdate;
                         
                            oEntry.Mctime = now.getHours().toString() + now.getMinutes().toString() + now.getSeconds().toString();
                            oEntry.Uname = submitJson.valUsrName;
                            oEntry.Natsec = oView.byId("cbx_SecThreatLvls_nat").getValue();
                            oEntry.Dwrsec = oView.byId("cbx_SecThreatLvls_dwr").getValue();
                            oEntry.Threatinf = submitJson.valMcdate + "WROR" + "THREATINF";
                            oEntry.Complex = oView.byId("cbx_CompCond_cmpIn").getValue();
                            oEntry.Isoreg = oView.byId("cbx_CompCond_Iso").getValue();
                            oEntry.Complxvolt = oView.byId("cbx_CompCond_Cvolt").getValue();
                            oEntry.Otccomplx = this.that.delcomma(submitJson.val_OtcMax.toString());
                            oEntry.Matchmw = this.that.delcomma(submitJson.val_OtcMatch.toString());
                            oEntry.Hy1rating = submitJson.valMcdate + "WROR" + "HY1RATING";
                            oEntry.Hy2rating = submitJson.valMcdate + "WROR" + "HY2RATING";
                            oEntry.Hy3rating = submitJson.valMcdate + "WROR" + "HY3RATING";
                            oEntry.Hy4rating = submitJson.valMcdate + "WROR" + "HY4RATING";
                            oEntry.Hy5rating = submitJson.valMcdate + "WROR" + "HY5RATING";
                            oEntry.Hy6rating = submitJson.valMcdate + "WROR" + "HY6RATING";
                            oEntry.Intake1 = this.that.delcomma(submitJson.val_ORI_Intk1.toString());
                            oEntry.Intake2 = this.that.delcomma(submitJson.val_ORI_Intk2.toString());
                            oEntry.Osw = submitJson.valMcdate + "WROR" + "OSW";
                            oEntry.Hyattltkey = submitJson.valMcdate + "WROR" + "HYATTLTKEY";
                            oEntry.Thplltkey = submitJson.valMcdate + "WROR" + "THPLLTKEY";
                            oEntry.Thdvltkey = submitJson.valMcdate + "WROR" + "THDVLTKEY";
                            oEntry.Maxelev = this.that.delcomma(submitJson.val_FloodElev.toString());
                            oEntry.Maxaf = this.that.delcomma(submitJson.val_FloodStorage.toString());
                            oEntry.Lkelev = this.that.delcomma(submitJson.val_PoolLake.toString());
                            oEntry.Tddelev = this.that.delcomma(submitJson.val_PoolTdd.toString());
                            oEntry.Thfbelev = this.that.delcomma(submitJson.val_PoolThFore.toString());
                            oEntry.Thabelev = this.that.delcomma(submitJson.val_PoolThAftr.toString());
                            oEntry.Cxorspill = this.that.delcomma(submitJson.val_CwrOrSp.toString());
                            oEntry.Cxpalermo = this.that.delcomma(submitJson.val_CwrPalermo.toString());
                            oEntry.Cxthbypass = this.that.delcomma(submitJson.val_CwrThB.toString());
                            oEntry.Cxthdvdam = this.that.delcomma(submitJson.val_CwrThDi.toString());
                            oEntry.Cxrvrout = this.that.delcomma(submitJson.val_CwrRivOut.toString());
                            oEntry.Cxsbcanal = this.that.delcomma(submitJson.val_CwrSutBu.toString());
                            oEntry.Cxwestlat = this.that.delcomma(submitJson.val_CwrWeLa.toString());
                            oEntry.Cxrchcanal = this.that.delcomma(submitJson.val_CwrRichC.toString());
                            oEntry.Cxwstcanal = this.that.delcomma(submitJson.val_CwrWestMain.toString());
                          
                            if (oEntry.Dwrsec === "ELEVATED" || oEntry.Dwrsec === "IMMINENT" ){ 
                                oEntry.Dthreatdt = oView.byId("SecTLExpD1").getValue();
                            }
                            else{
                                oEntry.Dthreatdt ="";


                            };
                            if (oEntry.Natsec === "ELEVATED" ||oEntry.Natsec === "IMMINENT" ){     
                                oEntry.Threatdt = oView.byId("SecTLExpD0").getValue();
                            }
                            else{
                                oEntry.Threatdt="";

                            };
                          
                                

                            var MidNgthCon = "";
                            var MidNgthConSrv = await this.that.postMidNgthConSrv(Service, oEntry);
                            if (MidNgthConSrv[0].result === "ERROR") {
                                MessageBox.error((MidNgthConSrv[0].data));
                            }
                            else {
                                var sserviceurlRmrks = "/sap/opu/odata/sap/ZODATA_MC_WRDTREM_OR_SRV/";
                                
                                var oModelRmrks = new sap.ui.model.odata.ODataModel(sserviceurlRmrks, true);
                                //var submitJsonRmrk = oView.getModel().getData();
                                var oEntryRmrks = {};


                                var oEntryRmrks = {};

                                oEntryRmrks.Zcwmremkey = submitJson.valMcdate + "WROR" + "OSW";
                                oEntryRmrks.Hy1rating = oView.byId("ipt_hy1_ltxt").getValue();
                                oEntryRmrks.Hy2rating = oView.byId("ipt_hy2_ltxt").getValue();
                                oEntryRmrks.Hy3rating = oView.byId("ipt_hy3_ltxt").getValue();
                                oEntryRmrks.Hy4rating = oView.byId("ipt_hy4_ltxt").getValue();
                                oEntryRmrks.Hy5rating = oView.byId("ipt_hy5_ltxt").getValue();
                                oEntryRmrks.Hy6rating = oView.byId("ipt_hy6_ltxt").getValue();
                                oEntryRmrks.Osw = oView.byId("OSW_OrComprmkTxt").getValue();
                                oEntryRmrks.Hyattltkey = oView.byId("hyattPlantrmkTxt").getValue();
                                oEntryRmrks.Thplltkey = oView.byId("ThermalPlantrmkTxt").getValue();
                                oEntryRmrks.Thdvltkey = oView.byId("ThermalDivrmkTxt").getValue();
                                oEntryRmrks.Threatinf = oView.byId("ipt_threatI").getValue();


                                var remarksSrv = await this.that.postRmrksSrv(oModelRmrks, oEntryRmrks);
                                if (remarksSrv[0].result === "ERROR") {
                                    MessageBox.error((remarksSrv[0].data));
                                }
                                else{
                                    var dataModel = this.that.getOwnerComponent().getModel("data");
                                     //MessageBox.success("Data submitted successfully")
                                     MessageBox.confirm("Data submitted successfully", {
                                        that1: this.that,
                                        view: oView,
                                        dataModelsbm:dataModel,
                                        actions: [MessageBox.Action.OK, MessageBox.Action.CANCEL],
                                        emphasizedAction: MessageBox.Action.OK,
                                        onClose: async function (sAction) {
                                            if (sAction === "OK") {
                                                var btnSb = this.that1.getView().byId("btn_Submit");
                                                //btnSb = view.byId("btn_Submit");
                                                btnSb.setEnabled(false);
                                                dataModel.setProperty("/valSubmitted", "This form has been submitted")
                                                //this.that1.onInit();
 
                                            }
                                        }
                                    })
                                    
                                    
                                    
                                    
                                    
                                    
                                    
                                    
                                    
                                    
                                    
                                    }
                                    






                               //
                            }


                        }
                    }
                });


            },
            
            postMidNgthConSrv: async function (UsrModel, data) {
                //Esto sirve para saber si una variables ya esta definida
                var resolve = "";
                var reject = "";
                const oPromise = await new Promise(function (resolve, reject) {
                    UsrModel.create("/ZSWCM_MC_WRORSet", data, {
                        // urlParameters: 
                        //"Divis": "'WRSJ'"
                        //"$top" : 1
                        //},
                        method: "POST",
                        success: (oData, oResponse) => {
                            //alert(oData.results[0].Accm);
                            //alert(oResponse);
                            resolve({ result: "SUCCESS", data: oResponse });
                            var UsrData = oData;
                            var UsrResp = oResponse;

                            //#endregion
                        },

                        error: (oData) => {
                            var usrError = ("Conection Error\n\r" + "URL: " + oData.response.requestUri.valueOf(Text) + "\n\rStatus: " + oData.response.statusCode.valueOf(Text) + "\n\rBody:" + oData.response.body.valueOf(Text));
                            resolve({ result: "ERROR", data: usrError });
                            reject(oData);
                            //MessageBox.error(usrError);

                        },


                    });

                });
                //data = oPromise.results;
                return [oPromise];

            },
            
            postRmrksSrv: async function (UsrModel, data) {
                //Esto sirve para saber si una variables ya esta definida
                var resolve = "";
                var reject = "";
                const oPromise = await new Promise(function (resolve, reject) {
                    UsrModel.create("/ZWCM_MC_WROR_REMARKSSet", data, {
                        // urlParameters: {
                        //"Divis": "'WRSJ'"
                        //"$top" : 1
                        //},
                        method: "POST",
                        success: (oData) => {
                            //alert(oData.results[0].Accm);
                            //alert(oResponse);
                            resolve({ result: "SUCCESS", data: oData });
                            var UsrData = oData;
                            var UsrResp = oResponse;

                            //#endregion
                        },

                        error: (oData) => {
                            var usrError = ("Conection Error\n\r" + "URL: " + oData.response.requestUri.valueOf(Text) + "\n\rStatus: " + oData.response.statusCode.valueOf(Text) + "\n\rBody:" + oData.response.body.valueOf(Text));
                            resolve({ result: "ERROR", data: usrError });
                            reject(oData);
                            //MessageBox.error(usrError);

                        },


                    });

                });
                //data = oPromise.results;
                return [oPromise];

            },
            onAfterRendering: function () {
              
                //jQuery.sap.delayedCall(500, this, function () {  this.byId("iptAqDlv2230").focus(); });
                jQuery.sap.delayedCall(500, this, function () {  this.byId("lbl_hdstate").focus(); });
                //var dummy = "X";
            },
                
                 


            







        });
    });
