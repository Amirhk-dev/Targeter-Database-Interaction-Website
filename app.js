//jshint esversion:6
var fs = require('fs'),
xml2js = require('xml2js');
var xmlParser = new xml2js.Parser();
const express = require('express');
const bodyParser = require("body-parser");
const database_connect = require(__dirname + "/database_connection.js");
const date = require(__dirname + "/date.js");
var app = express();

let mysql = require('mysql'); 
let connection = mysql.createConnection({
    host	 : 'mydevadmin.xfel.eu',
    user	 : 'euxfeltargets_dev',
    database : 'euxfeltargets_dev',
    password : 'L*-bQyK,JU&[',
    multipleStatements: true
});

let fiducialCounter = 0;
const fiducialList = ["Fiducial 1", "Fiducial 2", "Fiducial 3", "Fiducial 4"];
const fiducialPoints = ["Fiducial 1", "Fiducial 2", "Fiducial 3", "Fiducial 4"];

var subframe_itemNamesData = {"facility_name":"", "subframe_type":"", "serial_number":"", "group_name":"", "subframe_experiment_date":"",
    "subframe_experiment_time":"", "subframe_comments":"", "subframe_validity":"", "subframe_invalid_date":"", "subframe_invalid_time":"", 
    "subframe_device_select":"", "subframe_event_select":"", "subframe_link_to_data":"", "subframe_link_to_meta_data":"", 
    "subframe_event_experiment_date":"", "subframe_event_experiment_time":"", "subframe_events_comments":"", "subframe_fid1_validity":"", 
    "subframe_fid1_position_name":"", "subframe_fid1_x_position":"", "subframe_fid1_y_position":"", "subframe_fid1_z_position":"", 
    "subframe_fid1_date":"", "subframe_fid1_time":"", "subframe_fid2_validity":"", "subframe_fid2_position_name":"", "subframe_fid2_x_position":"", 
    "subframe_fid2_y_position":"", "subframe_fid2_z_position":"", "subframe_fid2_date":"", "subframe_fid2_time":"", "subframe_fid3_validity":"", 
    "subframe_fid3_position_name":"", "subframe_fid3_x_position":"", "subframe_fid3_y_position":"", "subframe_fid3_z_position":"", 
    "subframe_fid3_date":"", "subframe_fid3_time":""};

var roi_itemNamesData = {"roi_type":"", "roi_detection_method":"", "roi_experiment_x_position":"", "roi_experiment_y_position":"", 
    "roi_experiment_width":"", "roi_experiment_height":"", "roi_mask_load":"", "roi_experiment_date":"", "roi_experiment_time":"", 
    "roi_experiment_comments":"", "roi_device":"", "roi_event_type":"", "roi_event_link_to_data":"", "roi_event_link_to_meta_data":"", 
    "roi_event_date":"", "roi_event_time":"", "roi_event_comments":"", "":"roi_event_fid1_validity", "roi_event_fid1_position_name":"", 
    "roi_event_fid1_x_position":"", "roi_event_fid1_y_position":"", "roi_event_fid1_z_position":"", "roi_event_fid1_experiment_date":"", 
    "roi_event_fid1_experiment_time":"", "roi_event_fid2_validity":"", "roi_event_fid2_position_name":"", "roi_event_fid2_x_position":"", 
    "roi_event_fid2_y_position":"", "roi_event_fid2_z_position":"", "roi_event_fid2_experiment_date":"", "roi_event_fid1_experiment_time":"", 
    "roi_event_fid3_validity":"", "roi_event_fid3_position_name":"", "roi_event_fid3_x_position":"", "roi_event_fid3_y_position":"", 
    "roi_event_fid3_z_position":"", "roi_event_fid3_experiment_date":"", "roi_event_fid3_experiment_time":""};

var sample_itemNamesData = {"sample_experiment_x_position":"", "sample_experiment_y_position":"", "sample_experiment_width":"", "sample_experiment_height":"", 
    "sample_detection_method":"", "sample_mask_load":"", "sample_experiment_date":"", "sample_experiment_time":"", "sample_experiment_comments":"", 
    "sample_device":"", "sample_event_type":"", "sample_event_link_to_data":"", "sample_event_link_to_meta_data":"", 
    "sample_event_date":"", "sample_event_time":"", "sample_event_comments":"", "sample_event_fid1_validity":"", "sample_event_fid1_position_name":"", 
    "sample_event_fid1_x_position":"", "sample_event_fid1_y_position":"", "sample_event_fid1_z_position":"", "":"sample_event_fid1_experiment_date", 
    "sample_event_fid1_experiment_time":"", "sample_event_fid2_validity":"", "sample_event_fid2_position_name":"", "sample_event_fid2_x_position":"", 
    "sample_event_fid2_y_position":"", "sample_event_fid2_z_position":"", "sample_event_fid2_experiment_date":"", "sample_event_fid1_experiment_time":"",
    "sample_event_fid3_validity":"", "sample_event_fid3_position_name":"", "sample_event_fid3_x_position":"", "sample_event_fid3_y_position":"", 
    "sample_event_fid3_z_position":"", "sample_event_fid3_experiment_date":"", "sample_event_fid3_experiment_time":""};
    
var target_itemNamesData = {"target_x_position":"", "target_y_position":"", "target_z_position":"", "targetinfo_experiment_date":"", 
    "targetinfo_experiment_time":"", "target_comments":"", "target_device":"", "target_event_type":"", 
    "target_link_to_data":"", "target_link_to_meta_data":"", "target_event_experiment_date":"", "target_event_experiment_time":"", 
    "target_event_comments":"", "target_event_fid1_validity":"", "target_event_fid1_position_name":"", "target_event_fid1_x_position":"", 
    "target_event_fid1_y_position":"", "target_event_fid1_z_position":"", "target_event_fid1_experiment_date":"", "target_event_fid1_experiment_time":"",
    "target_event_fid2_validity":"", "target_event_fid2_position_name":"", "target_event_fid2_x_position":"", "target_event_fid2_y_position":"",
    "target_event_fid2_z_position":"", "target_event_fid2_experiment_date":"", "target_event_fid1_experiment_time":"", "target_event_fid3_validity":"",
    "target_event_fid3_position_name":"", "target_event_fid3_x_position":"", "target_event_fid3_y_position":"", "target_event_fid3_z_position":"",
    "target_event_fid3_experiment_date":"", "target_event_fid3_experiment_time":""};

var xml_data = [];
function assignTheValues(value) {
    xml_data = value;
}

var serial_number = [];

function checkEmpty(term, page_name) {
    var result = false;

    if (page_name === "subframe"){
        value_0 = (term.subframe_validity===false ? true:false);
        if (value_0) {
            value_1 = (term.facility_name==="Choose..." ? true:false);
            value_2 = (term.subframe_type==="Choose..." ? true:false);
            value_3 = (term.serial_number==='' ? true:false);
            value_4 = (term.group_name==="Choose..." ? true:false);
            value_5 = (term.subframe_experiment_date==='' ? true:false);
            value_6 = (term.subframe_experiment_time==='' ? true:false);
            value_7 = (term.subframe_comments==='' ? true:false);
            value_8 = (term.subframe_device_select==="Choose..." ? true:false);
            value_9 = (term.subframe_event_select==="Choose..." ? true:false);
            value_10 = (term.subframe_link_to_data==='' ? true:false);
            value_11 = (term.subframe_link_to_meta_data==='' ? true:false);
            value_12 = (term.subframe_event_experiment_date==='' ? true:false);
            value_13 = (term.subframe_event_experiment_time==='' ? true:false);
            value_14 = (term.subframe_events_comments==='' ? true:false);
            value_15 = (term.subframe_fid1_validity===false ? true:false);
            value_16 = (term.subframe_fid1_position_name==="Choose..." ? true:false);
            value_17 = (term.subframe_fid1_x_position==='' ? true:false);
            value_18 = (term.subframe_fid1_y_position==='' ? true:false);
            value_19 = (term.subframe_fid1_z_position==='' ? true:false);
            value_20 = (term.subframe_fid1_date==='' ? true:false);
            value_21 = (term.subframe_fid1_time==='' ? true:false);
            value_22 = (term.subframe_fid2_validity===false ? true:false);
            value_23 = (term.subframe_fid2_position_name==="Choose..." ? true:false);
            value_24 = (term.subframe_fid2_x_position==='' ? true:false);
            value_25 = (term.subframe_fid2_y_position==='' ? true:false);
            value_26 = (term.subframe_fid2_z_position==='' ? true:false);
            value_27 = (term.subframe_fid2_date==='' ? true:false);
            value_28 = (term.subframe_fid2_time==='' ? true:false);
            value_29 = (term.subframe_fid3_validity===false ? true:false);
            value_30 = (term.subframe_fid3_position_name==="Choose..." ? true:false);
            value_31 = (term.subframe_fid3_x_position==='' ? true:false);
            value_32 = (term.subframe_fid3_y_position==='' ? true:false);
            value_33 = (term.subframe_fid3_z_position==='' ? true:false);
            value_34 = (term.subframe_fid3_date==='' ? true:false);
            value_35 = (term.subframe_fid3_time==='' ? true:false);

            result = (value_0 | value_1 | value_2 | value_3 | value_4 | value_5 | value_6 | value_7 | value_8 | 
                value_9 | value_10 | value_11 | value_12 | value_13 | value_14 | value_15 | value_16 | value_17 |
                value_18 | value_19 | value_20 | value_21 | value_22 | value_23 | value_24 | value_25 | value_26 |
                value_27 | value_27 | value_28 | value_29 | value_30 | value_31 | value_32 | value_33 | value_34 | value_35);

        } else {
            value_1 = (term.subframe_invalid_date==='' ? true:false);
            value_2 = (term.subframe_invalid_time==='' ? true:false);
            
            result = (value_1 | value_2);

        }
    } else if (page_name === "roi") {
        value_0 = (roi_itemNamesData.roi_type==="Choose..." ? true:false);
        value_1 = (roi_itemNamesData.roi_detection_method==="Choose..." ? true:false);
        value_2 = (roi_itemNamesData.roi_experiment_x_position==='' ? true:false);
        value_3 = (roi_itemNamesData.roi_experiment_y_position==='' ? true:false);
        value_4 = (roi_itemNamesData.roi_experiment_width==='' ? true:false);
        value_5 = (roi_itemNamesData.roi_experiment_height==='' ? true:false);
        value_6 = (roi_itemNamesData.roi_mask_load==='' ? true:false);
        value_7 = (roi_itemNamesData.roi_experiment_date==='' ? true:false);
        value_8 = (roi_itemNamesData.roi_experiment_time==='' ? true:false);
        value_9 = (roi_itemNamesData.roi_experiment_comments==='' ? true:false);
        value_10 = (roi_itemNamesData.roi_device==="Choose..." ? true:false);
        value_11 = (roi_itemNamesData.roi_event_type==="Choose..." ? true:false);
        value_12 = (roi_itemNamesData.roi_event_link_to_data==='' ? true:false);
        value_13 = (roi_itemNamesData.roi_event_link_to_meta_data==='' ? true:false);
        value_14 = (roi_itemNamesData.roi_event_date==='' ? true:false);
        value_15 = (roi_itemNamesData.roi_event_time==='' ? true:false);
        value_16 = (roi_itemNamesData.roi_event_comments==='' ? true:false);
        value_17 = (roi_itemNamesData.roi_event_fid1_validity===false ? true:false);
        value_18 = (roi_itemNamesData.roi_event_fid1_position_name==="Choose..." ? true:false);
        value_19 = (roi_itemNamesData.roi_event_fid1_x_position==='' ? true:false);
        value_20 = (roi_itemNamesData.roi_event_fid1_y_position==='' ? true:false);
        value_21 = (roi_itemNamesData.roi_event_fid1_z_position==='' ? true:false);
        value_22 = (roi_itemNamesData.roi_event_fid1_experiment_date==='' ? true:false);
        value_23 = (roi_itemNamesData.roi_event_fid1_experiment_time==='' ? true:false);
        value_24 = (roi_itemNamesData.roi_event_fid2_validity===false ? true:false);
        value_25 = (roi_itemNamesData.roi_event_fid2_position_name==="Choose..." ? true:false);
        value_26 = (roi_itemNamesData.roi_event_fid2_x_position==='' ? true:false);
        value_27 = (roi_itemNamesData.roi_event_fid2_y_position==='' ? true:false);
        value_28 = (roi_itemNamesData.roi_event_fid2_z_position==='' ? true:false);
        value_29 = (roi_itemNamesData.roi_event_fid2_experiment_date==='' ? true:false);
        value_30 = (roi_itemNamesData.roi_event_fid1_experiment_time==='' ? true:false);
        value_31 = (roi_itemNamesData.roi_event_fid3_validity===false ? true:false);
        value_32 = (roi_itemNamesData.roi_event_fid3_position_name==="Choose..." ? true:false);
        value_33 = (roi_itemNamesData.roi_event_fid3_x_position==='' ? true:false);
        value_34 = (roi_itemNamesData.roi_event_fid3_y_position==='' ? true:false);
        value_35 = (roi_itemNamesData.roi_event_fid3_z_position==='' ? true:false);
        value_36 = (roi_itemNamesData.roi_event_fid3_experiment_date==='' ? true:false);
        value_37 = (roi_itemNamesData.roi_event_fid3_experiment_time==='' ? true:false);

        result = (value_0 | value_1 | value_2 | value_3 | value_4 | value_5 | value_6 | value_7 | value_8 | value_9 |
            value_10 | value_11 | value_12 | value_13 | value_14 | value_15 | value_16 | value_17 | value_18 | value_19 | value_20 |
            value_21 | value_22 | value_23 | value_24 | value_25 | value_26 | value_27 | value_28 | value_29 | value_30 | value_31 |
            value_32 | value_33 | value_34 | value_35 | value_36 | value_37);

    } else if (page_name==="sampleimage"){
        value_0 = (sample_itemNamesData.sample_experiment_x_position==='' ? true:false);
        value_1 = (sample_itemNamesData.sample_experiment_y_position==='' ? true:false);
        value_2 = (sample_itemNamesData.sample_experiment_width==='' ? true:false);
        value_3 = (sample_itemNamesData.sample_experiment_height==='' ? true:false);
        value_4 = (sample_itemNamesData.sample_detection_method==="Choose..." ? true:false);
        value_5 = (sample_itemNamesData.sample_mask_load==='' ? true:false);
        value_6 = (sample_itemNamesData.sample_experiment_date==='' ? true:false);
        value_7 = (sample_itemNamesData.sample_experiment_time==='' ? true:false);
        value_8 = (sample_itemNamesData.sample_experiment_comments==='' ? true:false);
        value_9 = (sample_itemNamesData.sample_device==="Choose..." ? true:false);
        value_10 = (sample_itemNamesData.sample_event_type==="Choose..." ? true:false);
        value_11 = (sample_itemNamesData.sample_event_link_to_data==='' ? true:false);
        value_12 = (sample_itemNamesData.sample_event_link_to_meta_data==='' ? true:false);
        value_13 = (sample_itemNamesData.sample_event_date==='' ? true:false);
        value_14 = (sample_itemNamesData.sample_event_time==='' ? true:false);
        value_15 = (sample_itemNamesData.sample_event_comments==='' ? true:false);
        value_16 = (sample_itemNamesData.sample_event_fid1_validity===false ? true:false);
        value_17 = (sample_itemNamesData.sample_event_fid1_position_name==="Choose..." ? true:false);
        value_18 = (sample_itemNamesData.sample_event_fid1_x_position==='' ? true:false);
        value_19 = (sample_itemNamesData.sample_event_fid1_y_position==='' ? true:false);
        value_20 = (sample_itemNamesData.sample_event_fid1_z_position==='' ? true:false);
        value_21 = (sample_itemNamesData.sample_event_fid1_experiment_date==='' ? true:false);
        value_22 = (sample_itemNamesData.sample_event_fid1_experiment_time==='' ? true:false);
        value_23 = (sample_itemNamesData.sample_event_fid2_validity===false ? true:false);
        value_24 = (sample_itemNamesData.sample_event_fid2_position_name==="Choose..." ? true:false);
        value_25 = (sample_itemNamesData.sample_event_fid2_x_position==='' ? true:false);
        value_26 = (sample_itemNamesData.sample_event_fid2_y_position==='' ? true:false);
        value_27 = (sample_itemNamesData.sample_event_fid2_z_position==='' ? true:false);
        value_28 = (sample_itemNamesData.sample_event_fid2_experiment_date==='' ? true:false);
        value_29 = (sample_itemNamesData.sample_event_fid1_experiment_time==='' ? true:false);
        value_30 = (sample_itemNamesData.sample_event_fid3_validity===false ? true:false);
        value_31 = (sample_itemNamesData.sample_event_fid3_position_name==="Choose..." ? true:false);
        value_32 = (sample_itemNamesData.sample_event_fid3_x_position==='' ? true:false);
        value_33 = (sample_itemNamesData.sample_event_fid3_y_position==='' ? true:false);
        value_34 = (sample_itemNamesData.sample_event_fid3_z_position==='' ? true:false);
        value_35 = (sample_itemNamesData.sample_event_fid3_experiment_date==='' ? true:false);
        value_36 = (sample_itemNamesData.sample_event_fid3_experiment_time==='' ? true:false);

        result = (value_0 | value_1 | value_2 | value_3 | value_4 | value_5 | value_6 | value_7 | value_8 | value_9 |
            value_10 | value_11 | value_12 | value_13 | value_14 | value_15 | value_16 | value_17 | value_18 | value_19 | value_20 |
            value_21 | value_22 | value_23 | value_24 | value_25 | value_26 | value_27 | value_28 | value_29 | value_30 | value_31 |
            value_32 | value_33 | value_34 | value_35 | value_36);

    } else if (page_name==="targetdata") {
        value_0 = (target_itemNamesData.target_x_position==='' ? true:false);
        value_1 = (target_itemNamesData.target_y_position==='' ? true:false);
        value_2 = (target_itemNamesData.target_z_position==='' ? true:false);
        value_3 = (target_itemNamesData.targetinfo_experiment_date==='' ? true:false);
        value_4 = (target_itemNamesData.targetinfo_experiment_time==='' ? true:false);
        value_5 = (target_itemNamesData.target_comments==='' ? true:false);
        value_6 = (target_itemNamesData.target_device==="Choose..." ? true:false);
        value_7 = (target_itemNamesData.target_event_type==="Choose..." ? true:false);
        value_8 = (target_itemNamesData.target_link_to_data==='' ? true:false);
        value_9 = (target_itemNamesData.target_link_to_meta_data==='' ? true:false);
        value_10 = (target_itemNamesData.target_event_experiment_date==='' ? true:false);
        value_11 = (target_itemNamesData.target_event_experiment_time==='' ? true:false);
        value_12 = (target_itemNamesData.target_event_comments==='' ? true:false);
        value_13 = (target_itemNamesData.target_event_fid1_validity===false ? true:false);
        value_14 = (target_itemNamesData.target_event_fid1_position_name==="Choose..." ? true:false);
        value_15 = (target_itemNamesData.target_event_fid1_x_position==='' ? true:false);
        value_16 = (target_itemNamesData.target_event_fid1_y_position==='' ? true:false);
        value_17 = (target_itemNamesData.target_event_fid1_z_position==='' ? true:false);
        value_18 = (target_itemNamesData.target_event_fid1_experiment_date==='' ? true:false);
        value_19 = (target_itemNamesData.target_event_fid1_experiment_time==='' ? true:false);
        value_20 = (target_itemNamesData.target_event_fid2_validity===false ? true:false);
        value_21 = (target_itemNamesData.target_event_fid2_position_name==="Choose..." ? true:false);
        value_22 = (target_itemNamesData.target_event_fid2_x_position==='' ? true:false);
        value_23 = (target_itemNamesData.target_event_fid2_y_position==='' ? true:false);
        value_24 = (target_itemNamesData.target_event_fid2_z_position==='' ? true:false);
        value_25 = (target_itemNamesData.target_event_fid2_experiment_date==='' ? true:false);
        value_26 = (target_itemNamesData.target_event_fid1_experiment_time==='' ? true:false);
        value_27 = (target_itemNamesData.target_event_fid3_validity===false ? true:false);
        value_28 = (target_itemNamesData.target_event_fid3_position_name==="Choose..." ? true:false);
        value_29 = (target_itemNamesData.target_event_fid3_x_position==='' ? true:false);
        value_30 = (target_itemNamesData.target_event_fid3_y_position==='' ? true:false);
        value_31 = (target_itemNamesData.target_event_fid3_z_position==='' ? true:false);
        value_32 = (target_itemNamesData.target_event_fid3_experiment_date==='' ? true:false);
        value_33 = (target_itemNamesData.target_event_fid3_experiment_time==='' ? true:false);

        result = (value_0 | value_1 | value_2 | value_3 | value_4 | value_5 | value_6 | value_7 | value_8 | value_9 |
            value_10 | value_11 | value_12 | value_13 | value_14 | value_15 | value_16 | value_17 | value_18 | value_19 | value_20 |
            value_21 | value_22 | value_23 | value_24 | value_25 | value_26 | value_27 | value_28 | value_29 | value_30 | value_31 |
            value_32 | value_33);

    } else if (page_name==="xmldata") {
        result = true;
    }

    return result;
}

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static(__dirname + "/public"));
app.use(express.static(__dirname + "/imgs"));    

app.get("/", function(req, res){
    let query = "SELECT COUNT(*) as count FROM Subframe_Table";
    connection.query(query, function(err, results){
        if(err) 
            throw err;
        else            
            var count = results[0].count;
            serial_number = count+1;
        res.render("home", {data:count}); 
    });
});

app.post("/submitDataManually", function(req, res){
    let query = "SELECT COUNT(*) as count FROM Subframe_Table; SELECT MAX(SerialNumber)+1 as max_sr FROM Subframe_Table;";
    connection.query(query, function(err, results){
        if(err) 
            throw err;
        else
            var count = results[0][0].count;
        var max_sr = results[1][0].max_sr;        
        res.render("home_manually_subframe", {serialnumber: max_sr, utils: app.js});
    });
});

app.post("/createSubframe", function(req, res){ 
    let query = "SELECT COUNT(*) as count FROM Subframe_Table; SELECT MAX(SerialNumber)+1 as max_sr FROM Subframe_Table;";
    connection.query(query, function(err, results){
        if(err) 
            throw err;
        else
            var count = results[0][0].count;
            serial_number = count + 1;
        var max_sr = results[1][0].max_sr;        
        res.render("get_subframe_id", {data: count, serialnumber: max_sr});
    });      
});

app.post("/createSubframeOnDatabase", function(req, res){
    FacilityName = req.body.facility_name_select;
    SubframeType = req.body.subframe_type_select;

    var getFacilityID_query = "SELECT ID as facilityid FROM Facility_Table WHERE CodeName='" + FacilityName + "'; ";
    var getSubframeTypeID_query = "SELECT ID as subframetypeid FROM SubframeType_Table WHERE TypeName='" + SubframeType + "'; ";
    var createSubframeEntry = "INSERT INTO Subframe_Table (FacilityID, SubframeTypeID, SerialNumber) VALUES ((" + 
    "SELECT ID as facilityid FROM Facility_Table WHERE CodeName='" + FacilityName + "'), (" + 
    "SELECT ID as subframetypeid FROM SubframeType_Table WHERE TypeName='" + SubframeType + "'), " + serial_number + "); ";

    var q = getFacilityID_query + getSubframeTypeID_query + createSubframeEntry;

    var concat_zeros = 6 - serial_number.toString().length;
    if(concat_zeros>0){
        serial_number_text = serial_number.toString();
        for(let i=0; i<concat_zeros; i++){
            serial_number_text = '0' + serial_number_text;
        }
    }

    connection.query(q, function (error, result) {
        if (error) throw error;
        console.log(result);
        var facilityID = result[0][0].facilityid;
        var subframeTypeID = result[1][0].subframetypeid;
        var finalID = FacilityName + SubframeType + serial_number_text;
        console.log(finalID);
        res.render("show_subframe_id", {serial_number, FacilityName, SubframeType, finalID}); 
    });
});

app.post("/finishCreatingSubframeEntry", function(req, res){
    res.redirect("/");
});

app.post("/submitSubframeInfoManually", function(req, res){
    subframe_itemNamesData.subframe_validity = (req.body.subframe_validity ? true:false);
    var subframe_id = req.body.subframe_id;

    if(subframe_itemNamesData.subframe_validity){
        subframe_itemNamesData.facility_name = subframe_id.substr(0, 5);
        subframe_itemNamesData.subframe_type = subframe_id.substr(5, 3);
        subframe_itemNamesData.serial_number = Number(subframe_id.substr(8,));
        subframe_itemNamesData.group_name = req.body.group_name;
        subframe_itemNamesData.subframe_experiment_date = req.body.subframe_experiment_date;
        subframe_itemNamesData.subframe_experiment_time = req.body.subframe_experiment_time;
        subframe_itemNamesData.subframe_comments = req.body.subframe_comments;
        subframe_itemNamesData.subframe_device_select = req.body.subframe_device_select;
        subframe_itemNamesData.subframe_event_select = req.body.subframe_event_select;
        subframe_itemNamesData.subframe_link_to_data = req.body.subframe_link_to_data;
        subframe_itemNamesData.subframe_link_to_meta_data = req.body.subframe_link_to_meta_data;
        subframe_itemNamesData.subframe_event_experiment_date = req.body.subframe_event_experiment_date;
        subframe_itemNamesData.subframe_event_experiment_time = req.body.subframe_event_experiment_time;
        subframe_itemNamesData.subframe_events_comments = req.body.subframe_events_comments;
        subframe_itemNamesData.subframe_fid1_validity = (req.body.subframe_fid1_validity ? true:false);
        subframe_itemNamesData.subframe_fid1_position_name = req.body.subframe_fid1_position_name;
        subframe_itemNamesData.subframe_fid1_x_position = req.body.subframe_fid1_x_position;
        subframe_itemNamesData.subframe_fid1_y_position = req.body.subframe_fid1_y_position;
        subframe_itemNamesData.subframe_fid1_z_position = req.body.subframe_fid1_z_position;
        subframe_itemNamesData.subframe_fid1_date = req.body.subframe_fid1_date
        subframe_itemNamesData.subframe_fid1_time = req.body.subframe_fid1_time
        subframe_itemNamesData.subframe_fid2_validity = (req.body.subframe_fid2_validity ? true:false);
        subframe_itemNamesData.subframe_fid2_position_name = req.body.subframe_fid2_position_name;
        subframe_itemNamesData.subframe_fid2_x_position = req.body.subframe_fid2_x_position;
        subframe_itemNamesData.subframe_fid2_y_position = req.body.subframe_fid2_y_position;
        subframe_itemNamesData.subframe_fid2_z_position = req.body.subframe_fid2_z_position;
        subframe_itemNamesData.subframe_fid2_date = req.body.subframe_fid2_date;
        subframe_itemNamesData.subframe_fid2_time = req.body.subframe_fid2_time;
        subframe_itemNamesData.subframe_fid3_validity = (req.body.subframe_fid3_validity ? true:false);
        subframe_itemNamesData.subframe_fid3_position_name = req.body.subframe_fid3_position_name;
        subframe_itemNamesData.subframe_fid3_x_position = req.body.subframe_fid3_x_position;
        subframe_itemNamesData.subframe_fid3_y_position = req.body.subframe_fid3_y_position;
        subframe_itemNamesData.subframe_fid3_z_position = req.body.subframe_fid3_z_position;
        subframe_itemNamesData.subframe_fid3_date = req.body.subframe_fid3_date;
        subframe_itemNamesData.subframe_fid3_time = req.body.subframe_fid3_time;
    } else {
        subframe_itemNamesData.subframe_invalid_date = req.body.subframe_invalid_date;
        subframe_itemNamesData.subframe_invalid_time = req.body.subframe_invalid_time;
    }
        
    if (checkEmpty(subframe_itemNamesData, "subframe")) {
        let query = "SELECT COUNT(*) as count FROM Subframe_Table; SELECT MAX(SerialNumber)+1 as max_sr FROM Subframe_Table;";
        connection.query(query, function(err, results){
            if(err) 
                throw err;
            else
                var count = results[0][0].count;
            var max_sr = results[1][0].max_sr;        
            res.render("home_manually_subframe", {serialnumber: max_sr});
        });
    } else {
            res.render("manually_roi_image");
    }    
});

app.post("/submitROIImageManually", function(req, res){
    roi_itemNamesData.roi_type = req.body.roi_type;
    roi_itemNamesData.roi_detection_method = req.body.roi_detection_method;
    roi_itemNamesData.roi_experiment_x_position = req.body.roi_experiment_x_position;
    roi_itemNamesData.roi_experiment_y_position = req.body.roi_experiment_y_position;
    roi_itemNamesData.roi_experiment_width = req.body.roi_experiment_width;
    roi_itemNamesData.roi_experiment_height = req.body.roi_experiment_height;
    roi_itemNamesData.roi_mask_load = req.body.roi_mask_load;
    roi_itemNamesData.roi_experiment_date = req.body.roi_experiment_date;
    roi_itemNamesData.roi_experiment_time = req.body.roi_experiment_time;
    roi_itemNamesData.roi_experiment_comments = req.body.roi_experiment_comments;
    roi_itemNamesData.roi_device = req.body.roi_device;
    roi_itemNamesData.roi_event_type = req.body.roi_event_type;
    roi_itemNamesData.roi_event_link_to_data = req.body.roi_event_link_to_data;
    roi_itemNamesData.roi_event_link_to_meta_data = req.body.roi_event_link_to_meta_data;
    roi_itemNamesData.roi_event_date = req.body.roi_event_date;
    roi_itemNamesData.roi_event_time = req.body.roi_event_time;
    roi_itemNamesData.roi_event_comments = req.body.roi_event_comments;
    roi_itemNamesData.roi_event_fid1_validity = (req.body.roi_event_fid1_validity ? true:false);
    roi_itemNamesData.roi_event_fid1_position_name = req.body.roi_event_fid1_position_name;
    roi_itemNamesData.roi_event_fid1_x_position = req.body.roi_event_fid1_x_position;
    roi_itemNamesData.roi_event_fid1_y_position = req.body.roi_event_fid1_y_position;
    roi_itemNamesData.roi_event_fid1_z_position = req.body.roi_event_fid1_z_position;
    roi_itemNamesData.roi_event_fid1_experiment_date = req.body.roi_event_fid1_experiment_date;
    roi_itemNamesData.roi_event_fid1_experiment_time = req.body.roi_event_fid1_experiment_time;
    roi_itemNamesData.roi_event_fid2_validity = (req.body.roi_event_fid2_validity ? true:false);
    roi_itemNamesData.roi_event_fid2_position_name = req.body.roi_event_fid2_position_name;
    roi_itemNamesData.roi_event_fid2_x_position = req.body.roi_event_fid2_x_position;
    roi_itemNamesData.roi_event_fid2_y_position = req.body.roi_event_fid2_y_position;
    roi_itemNamesData.roi_event_fid2_z_position = req.body.roi_event_fid2_z_position;
    roi_itemNamesData.roi_event_fid2_experiment_date = req.body.roi_event_fid2_experiment_date;
    roi_itemNamesData.roi_event_fid1_experiment_time = req.body.roi_event_fid1_experiment_time;
    roi_itemNamesData.roi_event_fid3_validity = (req.body.roi_event_fid3_validity ? true:false);
    roi_itemNamesData.roi_event_fid3_position_name = req.body.roi_event_fid3_position_name;
    roi_itemNamesData.roi_event_fid3_x_position = req.body.roi_event_fid3_x_position;
    roi_itemNamesData.roi_event_fid3_y_position = req.body.roi_event_fid3_y_position;
    roi_itemNamesData.roi_event_fid3_z_position = req.body.roi_event_fid3_z_position;
    roi_itemNamesData.roi_event_fid3_experiment_date = req.body.roi_event_fid3_experiment_date;
    roi_itemNamesData.roi_event_fid3_experiment_time = req.body.roi_event_fid3_experiment_time;
        
    if (checkEmpty(roi_itemNamesData, "roi")) {
        res.render("manually_roi_image");
    } else { 
        res.render("manually_sample_image");
    }
});

app.post("/submitSampleImageManually", function(req, res){
    sample_itemNamesData.sample_experiment_x_position = req.body.sample_experiment_x_position;
    sample_itemNamesData.sample_experiment_y_position = req.body.sample_experiment_y_position;
    sample_itemNamesData.sample_experiment_width = req.body.sample_experiment_width;
    sample_itemNamesData.sample_experiment_height = req.body.sample_experiment_height;
    sample_itemNamesData.sample_detection_method = req.body.sample_detection_method;
    sample_itemNamesData.sample_mask_load = req.body.sample_mask_load;
    sample_itemNamesData.sample_experiment_date = req.body.sample_experiment_date;
    sample_itemNamesData.sample_experiment_time = req.body.sample_experiment_time;
    sample_itemNamesData.sample_experiment_comments = req.body.sample_experiment_comments;
    sample_itemNamesData.sample_device = req.body.sample_device;
    sample_itemNamesData.sample_event_type = req.body.sample_event_type;
    sample_itemNamesData.sample_event_link_to_data = req.body.sample_event_link_to_data;
    sample_itemNamesData.sample_event_link_to_meta_data = req.body.sample_event_link_to_meta_data;
    sample_itemNamesData.sample_event_date = req.body.sample_event_date;
    sample_itemNamesData.sample_event_time = req.body.sample_event_time;
    sample_itemNamesData.sample_event_comments = req.body.sample_event_comments;
    sample_itemNamesData.sample_event_fid1_validity = (req.body.sample_event_fid1_validity ? true:false);
    sample_itemNamesData.sample_event_fid1_position_name = req.body.sample_event_fid1_position_name;
    sample_itemNamesData.sample_event_fid1_x_position = req.body.sample_event_fid1_x_position;
    sample_itemNamesData.sample_event_fid1_y_position = req.body.sample_event_fid1_y_position;
    sample_itemNamesData.sample_event_fid1_z_position = req.body.sample_event_fid1_z_position;
    sample_itemNamesData.sample_event_fid1_experiment_date = req.body.sample_event_fid1_experiment_date;
    sample_itemNamesData.sample_event_fid1_experiment_time = req.body.sample_event_fid1_experiment_time;
    sample_itemNamesData.sample_event_fid2_validity = (req.body.sample_event_fid2_validity ? true:false);
    sample_itemNamesData.sample_event_fid2_position_name = req.body.sample_event_fid2_position_name;
    sample_itemNamesData.sample_event_fid2_x_position = req.body.sample_event_fid2_x_position;
    sample_itemNamesData.sample_event_fid2_y_position = req.body.sample_event_fid2_y_position;
    sample_itemNamesData.sample_event_fid2_z_position = req.body.sample_event_fid2_z_position;
    sample_itemNamesData.sample_event_fid2_experiment_date = req.body.sample_event_fid2_experiment_date;
    sample_itemNamesData.sample_event_fid1_experiment_time = req.body.sample_event_fid1_experiment_time;
    sample_itemNamesData.sample_event_fid3_validity = (req.body.sample_event_fid3_validity ? true:false);
    sample_itemNamesData.sample_event_fid3_position_name = req.body.sample_event_fid3_position_name
    sample_itemNamesData.sample_event_fid3_x_position = req.body.sample_event_fid3_x_position;
    sample_itemNamesData.sample_event_fid3_y_position = req.body.sample_event_fid3_y_position;
    sample_itemNamesData.sample_event_fid3_z_position = req.body.sample_event_fid3_z_position;
    sample_itemNamesData.sample_event_fid3_experiment_date = req.body.sample_event_fid3_experiment_date;
    sample_itemNamesData.sample_event_fid3_experiment_time = req.body.sample_event_fid3_experiment_time;

    if (checkEmpty(sample_itemNamesData, "sampleimage")) {
        res.render("manually_sample_image");
    } else {
        res.render("manually_target_data");
    }
});

app.post("/submitAllData", function(req, res){
    target_itemNamesData.target_x_position = req.body.target_x_position;
    target_itemNamesData.target_y_position = req.body.target_y_position;
    target_itemNamesData.target_z_position = req.body.target_z_position;
    target_itemNamesData.targetinfo_experiment_date = req.body.targetinfo_experiment_date;
    target_itemNamesData.targetinfo_experiment_time = req.body.targetinfo_experiment_time;
    target_itemNamesData.target_comments = req.body.target_comments;
    target_itemNamesData.target_device = req.body.target_device;
    target_itemNamesData.target_event_type = req.body.target_event_type;
    target_itemNamesData.target_link_to_data = req.body.target_link_to_data;
    target_itemNamesData.target_link_to_meta_data = req.body.target_link_to_meta_data;
    target_itemNamesData.target_event_experiment_date = req.body.target_event_experiment_date;
    target_itemNamesData.target_event_experiment_time = req.body.target_event_experiment_time;
    target_itemNamesData.target_event_comments = req.body.target_event_comments;
    target_itemNamesData.target_event_fid1_validity = (req.body.target_event_fid1_validity ? true:false);
    target_itemNamesData.target_event_fid1_position_name = req.body.target_event_fid1_position_name;
    target_itemNamesData.target_event_fid1_x_position = req.body.target_event_fid1_x_position;
    target_itemNamesData.target_event_fid1_y_position = req.body.target_event_fid1_y_position;
    target_itemNamesData.target_event_fid1_z_position = req.body.target_event_fid1_z_position;
    target_itemNamesData.target_event_fid1_experiment_date = req.body.target_event_fid1_experiment_date;
    target_itemNamesData.target_event_fid1_experiment_time = req.body.target_event_fid1_experiment_time;
    target_itemNamesData.target_event_fid2_validity = (req.body.target_event_fid2_validity ? true:false);
    target_itemNamesData.target_event_fid2_position_name = req.body.target_event_fid2_position_name;
    target_itemNamesData.target_event_fid2_x_position = req.body.target_event_fid2_x_position;
    target_itemNamesData.target_event_fid2_y_position = req.body.target_event_fid2_y_position;
    target_itemNamesData.target_event_fid2_z_position = req.body.target_event_fid2_z_position;
    target_itemNamesData.target_event_fid2_experiment_date = req.body.target_event_fid2_experiment_date;
    target_itemNamesData.target_event_fid1_experiment_time = req.body.target_event_fid1_experiment_time;
    target_itemNamesData.target_event_fid3_validity = (req.body.target_event_fid3_validity ? true:false);
    target_itemNamesData.target_event_fid3_position_name = req.body.target_event_fid3_position_name;
    target_itemNamesData.target_event_fid3_x_position = req.body.target_event_fid3_x_position;
    target_itemNamesData.target_event_fid3_y_position = req.body.target_event_fid3_y_position;
    target_itemNamesData.target_event_fid3_z_position = req.body.target_event_fid3_z_position;
    target_itemNamesData.target_event_fid3_experiment_date = req.body.target_event_fid3_experiment_date;
    target_itemNamesData.target_event_fid3_experiment_time = req.body.target_event_fid3_experiment_time;

    if (checkEmpty(target_itemNamesData, "targetdata")) {
        res.render("manually_target_data");
    } else {
        var subframe_query = "INSERT INTO Subframe_Table (GroupID, SubframeTypeID, FacilityID, SerialNumber, SizeX, SizeY, Comments, CreateTimeStamp, Validity)" + 
        " VALUES ((SELECT ID FROM GroupInformation_Table WHERE GroupName='" + subframe_itemNamesData.GroupName + 
        "'), (SELECT ID FROM SubframeType_Table WHERE Type='" + subframe_itemNamesData.SubframeTypeSelect +
        "'), (SELECT ID FROM Facility_Table WHERE CodeName='" + subframe_itemNamesData.FacilityNameSelect + 
        "'), " + serial_number + ", " +  subframe_itemNamesData.SizeX + ", " + subframe_itemNamesData.SizeY + ", '" + subframe_itemNamesData.SubframeComments + "', '" + 
        subframe_itemNamesData.SubframeExperimentDate + " " + subframe_itemNamesData.SubframeExperimentTime + ":00', " + subframe_itemNamesData.SubframeValidity  + "); ";

        console.log(serial_number);

        var subframeeventtype_query = "INSERT INTO SubframeEvent_Table (SubframeID, CreateTimeStamp, EventTypeID) VALUES ((SELECT MAX(ID) FROM Subframe), '" +
        subframe_itemNamesData.SubframeExperimentDate + " " + subframe_itemNamesData.SubframeExperimentTime + ":00', " + 
        "(SELECT ID FROM Subframe_Event_Type WHERE EventType='" + subframe_itemNamesData.SubframeEventTypeName + "')); ";   

        var fiducial_query = "INSERT INTO Fiducial (SubFrameID, Validity, PositionID, X, Y, Z)" +
        " VALUES ((SELECT MAX(ID) FROM Subframe), " + fiducials_itemNamesData.Fid1Validity + 
        ", (SELECT ID FROM Fiducial_Position WHERE PositionName='" + fiducials_itemNamesData.Fid1PositionName +"'), " + 
        fiducials_itemNamesData.Fid1XPosition + ", " + fiducials_itemNamesData.Fid1YPosition + ", " + fiducials_itemNamesData.Fid1ZPosition + "); " +
        "INSERT INTO Fiducial (SubFrameID, Validity, PositionID, X, Y, Z)" +
        " VALUES ((SELECT MAX(ID) FROM Subframe), " + fiducials_itemNamesData.Fid2Validity + 
        ", (SELECT ID FROM Fiducial_Position WHERE PositionName='" + fiducials_itemNamesData.Fid2PositionName +"'), " + 
        fiducials_itemNamesData.Fid2XPosition + ", " + fiducials_itemNamesData.Fid2YPosition + ", " + fiducials_itemNamesData.Fid2ZPosition + "); " +
        "INSERT INTO Fiducial (SubFrameID, Validity, PositionID, X, Y, Z)" +
        " VALUES ((SELECT MAX(ID) FROM Subframe), " + fiducials_itemNamesData.Fid3Validity + 
        ", (SELECT ID FROM Fiducial_Position WHERE PositionName='" + fiducials_itemNamesData.Fid3PositionName +"'), " + 
        fiducials_itemNamesData.Fid3XPosition + ", " + fiducials_itemNamesData.Fid3YPosition + ", " + fiducials_itemNamesData.Fid3ZPosition + "); " +
        "INSERT INTO Fiducial (SubFrameID, Validity, PositionID, X, Y, Z)" +
        " VALUES ((SELECT MAX(ID) FROM Subframe), " + fiducials_itemNamesData.Fid4Validity + 
        ", (SELECT ID FROM Fiducial_Position WHERE PositionName='" + fiducials_itemNamesData.Fid4PositionName +"'), " + 
        fiducials_itemNamesData.Fid4XPosition + ", " + fiducials_itemNamesData.Fid4YPosition + ", " + fiducials_itemNamesData.Fid4ZPosition + "); ";
    
        var overviewimage_query = "INSERT INTO OverviewImage_Event (SubframeID, CreateTimeStamp, MicroscopeID, MethodID, LinkToImage, Validity, Comments)" +
        " VALUES ((SELECT MAX(ID) FROM Subframe), '" + overviewimage_itemNamesData.OverviewImageExperimentDate + " " +  
        overviewimage_itemNamesData.OverviewImageExperimentTime + ":00', " + 
        "(SELECT ID FROM Microscope_Type WHERE MicroscopeName='" + overviewimage_itemNamesData.MicroscopeData + "'), (SELECT ID FROM Detection_Method WHERE MethodName='" + overviewimage_itemNamesData.DetectionMethod + "'), '" + overviewimage_itemNamesData.OverviewImageLoad + "', " + 
        overviewimage_itemNamesData.OverviewImageValidity + ", '" + overviewimage_itemNamesData.OverviewImageComments + "'); ";

        var roiimage_query = "INSERT INTO ROITable (OverviewImageEventID, MicroscopeID, MethodID, CreateTimeStamp, LinkToImage, " + 
        "BoundingBoxXPosition, BoundingBoxYPosition, BoundingBoxWidth, BoundingBoxHeight, Validity, Comments) VALUES (" +
        "(SELECT MAX(ID) FROM OverviewImage_Event), (SELECT ID FROM Microscope_Type WHERE MicroscopeName='" + roi_itemNamesData.MicroscopeData + 
        "'), (SELECT ID FROM Detection_Method WHERE MethodName='" + roi_itemNamesData.DetectionMethod + "'), '" + roi_itemNamesData.ROIExperimentDate + " " + 
        roi_itemNamesData.ROIExperimentTime + ":00', '" + roi_itemNamesData.ROIOverviewImageLoad + "', " + roi_itemNamesData.ROIExperimentXPosition + ", " + 
        roi_itemNamesData.ROIExperimentYPosition + ", " + roi_itemNamesData.ROIExperimentWidth + ", " + roi_itemNamesData.ROIExperimentHeight + ", " + 
        roi_itemNamesData.ROIImageValidity + ", '" + roi_itemNamesData.ROIExperimentComments + "'); "; 

        var sampletable_query = "INSERT INTO SampleTable (ROIID, PixelSizeX, PixelSizeY, BoundingBoxXPosition, BoundingBoxYPosition, " + 
        "BoundingBoxWidth, BoundingBoxHeight, MaskDirectory, Validity, Comments, CreateTimeStamp) VALUES ((SELECT MAX(ID) FROM ROITable), " +
        sample_itemNamesData.PixelSizeX + ", " + sample_itemNamesData.PixelSizeY + ", " + sample_itemNamesData.BBXPosition + ", " + 
        sample_itemNamesData.BBYPosition + ", " + sample_itemNamesData.BBWidth + ", " + sample_itemNamesData.BBHeight + ", '" + 
        sample_itemNamesData.MaskImageLoad + "', " + sample_itemNamesData.SampleImageValidity + ", '" + sample_itemNamesData.SampleComments + "', '" + 
        sample_itemNamesData.SampleimageExperimentDate + " " + sample_itemNamesData.SampleimageExperimentTime + ":00'); ";

        var imagedata_query = "INSERT INTO Image_Data (SampleID, MicroscopeID, MethodID, ImageType, ImageWidth, ImageHeight, ImageMemorySize, " +
        "LinkToImage, Validity, CreateTimeStamp, Comments) VALUES ((SELECT MAX(ID) FROM SampleTable), (SELECT ID FROM Microscope_Type WHERE MicroscopeName='" + 
        sample_itemNamesData.SampleMicroscopeData + "'), (SELECT ID FROM Detection_Method WHERE MethodName='" + sample_itemNamesData.SampleDetectionMethod + "'), '" + 
        sample_itemNamesData.ImageType + "', " + sample_itemNamesData.ImageWidth + ", " + sample_itemNamesData.ImageHeight + ", " + 
        sample_itemNamesData.ImageSize + ", '" + sample_itemNamesData.ROIImageLoad + "', " + sample_itemNamesData.SampleInfoValidity + ", '" + 
        sample_itemNamesData.SampleinfoExperimentDate + " " + sample_itemNamesData.SampleinfoExperimentTime + ":00', '" + sample_itemNamesData.ImageComments + "'); ";

        var target_query = "INSERT INTO Target (SampleID, Theta, Phi, Rho, StatusID, Validity, CreateTimeStamp, Comments) VALUES (" +
        "(SELECT MAX(ID) FROM SampleTable), " + target_itemNamesData.ThetaAngle + ", " + target_itemNamesData.PhiAngle + ", " + target_itemNamesData.RhoAngle + 
        ", (SELECT ID FROM Target_Status WHERE Status='" + target_itemNamesData.TargetStatus + "'), " + target_itemNamesData.TargetImageValidity + ", '" + 
        target_itemNamesData.TargetinfoExperimentDate + " " + target_itemNamesData.TargetinfoExperimentTime + ":00', '" + 
        target_itemNamesData.TargetComments + "'); ";

        var positiondata_query = "INSERT INTO Position_Data (TargetID, X, Y, Z, InPlaneAccuracy, OutOfPlaneAccuracy, Validity, CreateTimeStamp) VALUES (" +
        "(SELECT MAX(ID) FROM Target), " + target_itemNamesData.TargetXPosition + ", " + target_itemNamesData.TargetYPosition + ", " + 
        target_itemNamesData.TargetZPosition + ", " + target_itemNamesData.InplaneAccuracy + ", " + target_itemNamesData.OutOfPlaneAccuracy + 
        ", " + target_itemNamesData.TargetValidity + ", '" + target_itemNamesData.TargetpositioninfoExperimentDate + " " +  
        target_itemNamesData.TargetpositioninfoExperimentTime + ":00'); ";

        var xfeldata_query = "INSERT INTO XFEL_Data (TargetID, InstrumentID, CreateTimeStamp, Comments) VALUES ((SELECT MAX(ID) FROM Target), " + 
        "(SELECT ID FROM Instrument WHERE Name='" + target_itemNamesData.InstrumentUsed + "'), '" +  target_itemNamesData.XFELDataExperimentDate + " " + 
        target_itemNamesData.XFELDataExperimentTime + "', '" + target_itemNamesData.TargetInstrumentComments + "'); ";
    
        var q = subframe_query + subframeeventtype_query + fiducial_query + overviewimage_query + roiimage_query + sampletable_query + 
        imagedata_query + target_query + positiondata_query + xfeldata_query;

        /*
        connection.query(q, function (error, result) {
            if (error) throw error;
            console.log(result);
            res.redirect("/");
        });*/ 
    }
});

app.post("/submitXMLFile", function(req, res){
    // Find count of Subframes in DB and Respond with that count
    var q = "SELECT COUNT(*) as count FROM Subframe; SELECT MAX(SerialNumber)+1 as max_sr FROM Subframe;";
    connection.query(q, function(err, results){
        if(err) throw err;
        var count = results[0][0].count;
        serial_number = count+1;
        var max_sr = results[1][0].max_sr; // maximum serial number + 1
        
        fs.readFile(req.body.xmlFile,function(err, data){
            xml_data = data;
            xmlParser.parseString(data, function(err, result){
                //console.dir(result);
                //console.dir(result.experiment.subframe[0].Comments);
                //console.dir(result.experiment.overviewimage[0].MicroscopeType);
                assignTheValues(result);
                //console.dir(result.experiment.subframe[0].GroupName);
                //console.dir(result.experiment.fiducials[0].fiducial1[0].Validity);
                //console.dir(result.experiment.fiducials[0].fiducial1);
                //console.log('Read finished!');
                // Looks for "home.ejs", and by default it is looking in "view"
                res.render("home_xml_data", {
                    data: count,
                    serialnumber: max_sr, 
                    subframe_validity: result.experiment.subframe[0].Validity,
                    subframe_facilityname: result.experiment.subframe[0].FacilityName,
                    subframe_typename: result.experiment.subframe[0].TypeName,
                    subframe_groupname: result.experiment.subframe[0].GroupName,
                    subframe_sizex: result.experiment.subframe[0].SizeX,
                    subframe_sizey: result.experiment.subframe[0].SizeY,
                    subframe_comments: result.experiment.subframe[0].Comments,
                    subframe_experimentdate: result.experiment.subframe[0].ExperimentDate,
                    subframe_experimenttime: result.experiment.subframe[0].ExperimentTime,
                    subframe_eventtype: result.experiment.subframe[0].EventType,
                    fid1_validity: result.experiment.fiducials[0].fiducial1[0].Validity,
                    fid1_positionname: result.experiment.fiducials[0].fiducial1[0].PositionName,
                    fid1_xposition: result.experiment.fiducials[0].fiducial1[0].X_position,
                    fid1_yposition: result.experiment.fiducials[0].fiducial1[0].Y_position,
                    fid1_zposition: result.experiment.fiducials[0].fiducial1[0].Z_position,
                    fid2_validity: result.experiment.fiducials[0].fiducial2[0].Validity,
                    fid2_positionname: result.experiment.fiducials[0].fiducial2[0].PositionName,
                    fid2_xposition: result.experiment.fiducials[0].fiducial2[0].X_position,
                    fid2_yposition: result.experiment.fiducials[0].fiducial2[0].Y_position,
                    fid2_zposition: result.experiment.fiducials[0].fiducial2[0].Z_position,
                    fid3_validity: result.experiment.fiducials[0].fiducial3[0].Validity,
                    fid3_positionname: result.experiment.fiducials[0].fiducial3[0].PositionName,
                    fid3_xposition: result.experiment.fiducials[0].fiducial3[0].X_position,
                    fid3_yposition: result.experiment.fiducials[0].fiducial3[0].Y_position,
                    fid3_zposition: result.experiment.fiducials[0].fiducial3[0].Z_position,
                    fid4_validity: result.experiment.fiducials[0].fiducial4[0].Validity,
                    fid4_positionname: result.experiment.fiducials[0].fiducial4[0].PositionName,
                    fid4_xposition: result.experiment.fiducials[0].fiducial4[0].X_position,
                    fid4_yposition: result.experiment.fiducials[0].fiducial4[0].Y_position,
                    fid4_zposition: result.experiment.fiducials[0].fiducial4[0].Z_position,
                    overviewimage_validity: result.experiment.overviewimage[0].Validity,
                    overviewimage_microscopetype: result.experiment.overviewimage[0].MicroscopeType,
                    overviewimage_detectionmethod: result.experiment.overviewimage[0].DetectionMethod,
                    overviewimage_imageload: result.experiment.overviewimage[0].ImageLoad,
                    overviewimage_experimentdate: result.experiment.overviewimage[0].ExperimentDate,
                    overviewimage_experimenttime: result.experiment.overviewimage[0].ExperimentTime, 
                    overviewimage_comments: result.experiment.overviewimage[0].Comments,
                    roi1_validity: result.experiment.roiimages[0].roi1[0].Validity,
                    roi1_microscopetype: result.experiment.roiimages[0].roi1[0].MicroscopeType,
                    roi1_detectionmethod: result.experiment.roiimages[0].roi1[0].DetectionMethod,
                    roi1_bbxposition: result.experiment.roiimages[0].roi1[0].BBXPosition,
                    roi1_bbyposition: result.experiment.roiimages[0].roi1[0].BBYPosition,
                    roi1_bbwidth: result.experiment.roiimages[0].roi1[0].BBWidth,
                    roi1_bbheight: result.experiment.roiimages[0].roi1[0].BBHeight,
                    roi1_imageload: result.experiment.roiimages[0].roi1[0].ImageLoad,
                    roi1_experimentdate: result.experiment.roiimages[0].roi1[0].ExperimentDate,
                    roi1_experimenttime: result.experiment.roiimages[0].roi1[0].ExperimentTime,
                    roi1_comments: result.experiment.roiimages[0].roi1[0].Comments,
                    sample1_validity: result.experiment.sampleimages[0].sample1[0].Validity,
                    sample1_pixelsizex: result.experiment.sampleimages[0].sample1[0].PixelSizeX,
                    sample1_pixelsizey: result.experiment.sampleimages[0].sample1[0].PixelSizeY,
                    sample1_bbxposition: result.experiment.sampleimages[0].sample1[0].BBXPosition,
                    sample1_bbyposition: result.experiment.sampleimages[0].sample1[0].BBYPosition,
                    sample1_bbwidth: result.experiment.sampleimages[0].sample1[0].BBWidth,
                    sample1_bbheight: result.experiment.sampleimages[0].sample1[0].BBHeight,
                    sample1_maskimageload: result.experiment.sampleimages[0].sample1[0].MaskImageLoad,
                    sample1_sampleexperimentdate: result.experiment.sampleimages[0].sample1[0].SampleExperimentDate,
                    sample1_sampleexperimenttime: result.experiment.sampleimages[0].sample1[0].SampleExperimentTime,
                    sample1_samplecomments: result.experiment.sampleimages[0].sample1[0].SampleComments,
                    sample1_sampleimagevalidity: result.experiment.sampleimages[0].sample1[0].SampleImageValidity,
                    sample1_microscopetype: result.experiment.sampleimages[0].sample1[0].MicroscopeType,
                    sample1_detectionmethod: result.experiment.sampleimages[0].sample1[0].DetectionMethod,
                    sample1_imagetype: result.experiment.sampleimages[0].sample1[0].ImageType,
                    sample1_imagewidth: result.experiment.sampleimages[0].sample1[0].ImageWidth,
                    sample1_imageheight: result.experiment.sampleimages[0].sample1[0].ImageHeight,
                    sample1_imagesize: result.experiment.sampleimages[0].sample1[0].ImageSize,
                    sample1_imagecomments: result.experiment.sampleimages[0].sample1[0].ImageComments,
                    sample1_imageload: result.experiment.sampleimages[0].sample1[0].ImageLoad,
                    sample1_experimentdate: result.experiment.sampleimages[0].sample1[0].ExperimentDate,
                    sample1_experimenttime: result.experiment.sampleimages[0].sample1[0].ExperimentTime,
                    target1_validity: result.experiment.targets[0].target1[0].Validity,
                    target1_status: result.experiment.targets[0].target1[0].Status,
                    target1_thetaangle: result.experiment.targets[0].target1[0].ThetaAngle,
                    target1_phiangle: result.experiment.targets[0].target1[0].PhiAngle,
                    target1_rhoangle: result.experiment.targets[0].target1[0].RhoAngle,
                    target1_experimentdate: result.experiment.targets[0].target1[0].ExperimentDate,
                    target1_experimenttime: result.experiment.targets[0].target1[0].ExperimentTime,
                    target1_comments: result.experiment.targets[0].target1[0].Comments,
                    target1_positionvalidity: result.experiment.targets[0].target1[0].PositionValidity,
                    target1_xposition: result.experiment.targets[0].target1[0].XPosition,
                    target1_yposition: result.experiment.targets[0].target1[0].YPosition,
                    target1_zposition: result.experiment.targets[0].target1[0].ZPosition,
                    target1_inplaneaccuracy: result.experiment.targets[0].target1[0].InplaneAccuracy,
                    target1_outofplaneaccuracy: result.experiment.targets[0].target1[0].OutofplaneAccuracy,
                    target1_positionexperimentdate: result.experiment.targets[0].target1[0].PositionExperimentDate,
                    target1_positionexperimenttime: result.experiment.targets[0].target1[0].PositionExperimentTime,
                    target1_instrument: result.experiment.targets[0].target1[0].Instrument,
                    target1_xfelexperimentdate: result.experiment.targets[0].target1[0].XFELExperimentDate,
                    target1_xfelexperimenttime: result.experiment.targets[0].target1[0].XFELExperimentTime,
                    target1_xfelexperimentcomments: result.experiment.targets[0].target1[0].XFELExperimentComments
                });       
            });
        });
    });
});

app.post("/submitExperimentXML", function(req, res){
    //console.log(xml_data);
    //console.log(serial_number);
    console.log(req.body);

    // ***** Subframe Table ***** //
    var subframe_validity = (req.body.subframe_validity=="on" ? 1:0); 
    var facility_name_select = req.body.facility_name_select; 
    var subframe_type_select = req.body.subframe_type_select; 
    var group_name = req.body.group_name; 
    var size_x = req.body.size_x; 
    var size_y = req.body.size_y; 
    var subframe_comments = req.body.subframe_comments; 
    var subframe_experiment_date = req.body.subframe_experiment_date; 
    var subframe_experiment_time = req.body.subframe_experiment_time; 
    var subframe_event_type_name = req.body.subframe_event_type_name; 
    
    // ***** Fiducials Table ***** //
    var fid1_validity = (req.body.fid1_validity=="on" ? 1:0); //
    var fid1_position_name = req.body.fid1_position_name;
    var fid1_x_position = req.body.fid1_x_position;
    var fid1_y_position = req.body.fid1_y_position;
    var fid1_z_position = req.body.fid1_z_position;
    var fid2_validity = (req.body.fid2_validity=="on" ? 1:0);
    var fid2_position_name = req.body.fid2_position_name;
    var fid2_x_position = req.body.fid2_x_position;
    var fid2_y_position = req.body.fid2_y_position;
    var fid2_z_position = req.body.fid2_z_position;
    var fid3_validity = (req.body.fid3_validity=="on" ? 1:0);
    var fid3_position_name = req.body.fid3_position_name;
    var fid3_x_position = req.body.fid3_x_position;
    var fid3_y_position = req.body.fid3_y_position;
    var fid3_z_position = req.body.fid3_z_position;
    var fid4_validity = (req.body.fid4_validity=="on" ? 1:0);
    var fid4_position_name = req.body.fid4_position_name;
    var fid4_x_position = req.body.fid4_x_position;
    var fid4_y_position = req.body.fid4_y_position;
    var fid4_z_position = req.body.fid4_z_position;

    // ***** Overview Image Table ***** //
    var overview_image_validity = (req.body.overview_image_validity=="on" ? 1:0);
    var overviewimg_microscope_data = req.body.overviewimg_microscope_data;
    var overviewimg_detection_method = req.body.overviewimg_detection_method;
    var overview_image_load = req.body.overview_image_load;
    var overviewimage_experiment_date = req.body.overviewimage_experiment_date;
    var overviewimage_experiment_time = req.body.overviewimage_experiment_time;
    var overviewimage_comments = req.body.overviewimage_comments;
    
    // ***** ROI Image Table ***** //
    var roi1_image_validity = (req.body.roi1_image_validity=="on" ? 1:0);
    var roi1_microscope_data = req.body.roi1_microscope_data;
    var roi1_detection_method = req.body.roi1_detection_method;
    var ROI1_BB_x_position = req.body.ROI1_BB_x_position;
    var ROI1_BB_y_position = req.body.ROI1_BB_y_position;
    var ROI1_BB_width = req.body.ROI1_BB_width;
    var ROI1_BB_height = req.body.ROI1_BB_height;
    var roi1_overviewimage_load = req.body.roi1_overviewimage_load;
    var roi1_experiment_date = req.body.roi1_experiment_date;
    var roi1_experiment_time = req.body.roi1_experiment_time;
    var roi1_comments = req.body.roi1_comments;

    // ***** Sample Information Table ***** //
    var sample_image_validity = (req.body.sample_image_validity=="on" ? 1:0);
    var pixel_size_x = req.body.pixel_size_x;
    var pixel_size_y = req.body.pixel_size_y;
    var BB_x_position = req.body.BB_x_position;
    var BB_y_position = req.body.BB_y_position;
    var BB_width = req.body.BB_width;
    var BB_height = req.body.BB_height;
    var mask_image_load = req.body.mask_image_load;
    var sampleimage_experiment_date = req.body.sampleimage_experiment_date;
    var sampleimage_experiment_time = req.body.sampleimage_experiment_time;
    var sample_comments = req.body.sample_comments;
    
    // ***** Sample Image Table ***** //
    var sample_info_validity = (req.body.sample_info_validity=="on" ? 1:0);
    var sample_microscope_data = req.body.sample_microscope_data;
    var sample_detection_method = req.body.sample_detection_method;
    var image_type = req.body.image_type;
    var image_width = req.body.image_width;
    var image_height = req.body.image_height;
    var image_size = req.body.image_size;
    var image_comments = req.body.image_comments;
    var image_load = req.body.image_load;
    var sampleinfo_experiment_date = req.body.sampleinfo_experiment_date;
    var sampleinfo_experiment_time = req.body.sampleinfo_experiment_time;

    // ***** Target Information Table ***** //
    var target_image_validity = (req.body.target_image_validity=="on" ? 1:0);
    var target_status = req.body.target_status;
    var theta_angle = req.body.theta_angle;
    var phi_angle = req.body.phi_angle;
    var rho_angle = req.body.rho_angle;
    var targetinfo_experiment_date = req.body.targetinfo_experiment_date;
    var targetinfo_experiment_time = req.body.targetinfo_experiment_time;
    var target_comments = req.body.target_comments;

    // ***** Target Position Table ***** //
    var target_validity = (req.body.target_validity=="on" ? 1:0);
    var target_x_position = req.body.target_x_position;
    var target_y_position = req.body.target_y_position;
    var target_z_position = req.body.target_z_position;
    var inplane_accuracy = req.body.inplane_accuracy;
    var out_of_plane_accuracy = req.body.out_of_plane_accuracy;
    var targetpositioninfo_experiment_date = req.body.targetpositioninfo_experiment_date;
    var targetpositioninfo_experiment_time = req.body.targetpositioninfo_experiment_time;

    // ***** XFEL Instrument Table ***** //
    var instrument_used = req.body.instrument_used;
    var xfeldata_experiment_date = req.body.xfeldata_experiment_date;
    var xfeldata_experiment_time = req.body.xfeldata_experiment_time;
    var target_instrument_comments = req.body.target_instrument_comments;
    
    //if (checkEmpty(req.body, "xmldata")){
    //    res.redirect("/submitXMLFile");
    //    //res.render("/submitExperimentXML");
    //} else {
    var subframe_query = "INSERT INTO Subframe (GroupID, SubframeTypeID, FacilityID, SerialNumber, SizeX, SizeY, Comments, CreateTimeStamp, Validity)" + 
    " VALUES ((SELECT ID FROM Group_Information WHERE GroupName='" + group_name + 
    "'), (SELECT ID FROM Subframe_Type WHERE Type='" + subframe_type_select +
    "'), (SELECT ID FROM Facility WHERE CodeName='" + facility_name_select + 
    "'), " + serial_number + ", " +  size_x + ", " + size_y + ", '" + subframe_comments + "', '" + 
    subframe_experiment_date + " " + subframe_experiment_time + ":00', " + subframe_validity  + "); ";

    var subframeeventtype_query = "INSERT INTO Subframe_Event (SubframeID, CreateTimeStamp, EventTypeID) VALUES ((SELECT MAX(ID) FROM Subframe), '" +
    subframe_experiment_date + " " + subframe_experiment_time + ":00', " + "(SELECT ID FROM Subframe_Event_Type WHERE EventType='" + subframe_event_type_name +
    "')); ";   

    var fiducial_query = "INSERT INTO Fiducial (SubFrameID, Validity, PositionID, X, Y, Z)" +
    " VALUES ((SELECT MAX(ID) FROM Subframe), " + fid1_validity + 
    ", (SELECT ID FROM Fiducial_Position WHERE PositionName='" + fid1_position_name +"'), " + 
    fid1_x_position + ", " + fid1_y_position + ", " + fid1_z_position + "); " +
    "INSERT INTO Fiducial (SubFrameID, Validity, PositionID, X, Y, Z)" +
    " VALUES ((SELECT MAX(ID) FROM Subframe), " + fid2_validity + 
    ", (SELECT ID FROM Fiducial_Position WHERE PositionName='" + fid2_position_name +"'), " + 
    fid2_x_position + ", " + fid2_y_position + ", " + fid2_z_position + "); " +
    "INSERT INTO Fiducial (SubFrameID, Validity, PositionID, X, Y, Z)" +
    " VALUES ((SELECT MAX(ID) FROM Subframe), " + fid3_validity + 
    ", (SELECT ID FROM Fiducial_Position WHERE PositionName='" + fid3_position_name +"'), " + 
    fid3_x_position + ", " + fid3_y_position + ", " + fid3_z_position + "); " +
    "INSERT INTO Fiducial (SubFrameID, Validity, PositionID, X, Y, Z)" +
    " VALUES ((SELECT MAX(ID) FROM Subframe), " + fid4_validity + 
    ", (SELECT ID FROM Fiducial_Position WHERE PositionName='" + fid4_position_name +"'), " + 
    fid4_x_position + ", " + fid4_y_position + ", " + fid4_z_position + "); ";
    
    var overviewimage_query = "INSERT INTO OverviewImage_Event (SubframeID, CreateTimeStamp, MicroscopeID, MethodID, LinkToImage, Validity, Comments)" +
    " VALUES ((SELECT MAX(ID) FROM Subframe), '" + overviewimage_experiment_date + " " +  overviewimage_experiment_time + ":00', " + 
    "(SELECT ID FROM Microscope_Type WHERE MicroscopeName='" + overviewimg_microscope_data + "'), (SELECT ID FROM Detection_Method WHERE MethodName='" + 
    overviewimg_detection_method + "'), '" + overview_image_load + "', " + overview_image_validity + ", '" + overviewimage_comments + "'); ";

    var roiimage_query = "INSERT INTO ROITable (OverviewImageEventID, MicroscopeID, MethodID, CreateTimeStamp, LinkToImage, " + 
    "BoundingBoxXPosition, BoundingBoxYPosition, BoundingBoxWidth, BoundingBoxHeight, Validity, Comments) VALUES (" +
    "(SELECT MAX(ID) FROM OverviewImage_Event), (SELECT ID FROM Microscope_Type WHERE MicroscopeName='" + roi1_microscope_data + 
    "'), (SELECT ID FROM Detection_Method WHERE MethodName='" + roi1_detection_method + "'), '" + roi1_experiment_date + " " + 
    roi1_experiment_time + ":00', '" + roi1_overviewimage_load + "', " + ROI1_BB_x_position + ", " + ROI1_BB_y_position + ", " + 
    ROI1_BB_width + ", " + ROI1_BB_height + ", " + roi1_image_validity + ", '" + roi1_comments + "'); "; 

    var sampletable_query = "INSERT INTO SampleTable (ROIID, PixelSizeX, PixelSizeY, BoundingBoxXPosition, BoundingBoxYPosition, " + 
    "BoundingBoxWidth, BoundingBoxHeight, MaskDirectory, Validity, Comments, CreateTimeStamp) VALUES ((SELECT MAX(ID) FROM ROITable), " +
    pixel_size_x + ", " + pixel_size_y + ", " + BB_x_position + ", " + BB_y_position + ", " + BB_width + ", " + BB_height + ", '" + 
    mask_image_load + "', " + sample_image_validity + ", '" +  sample_comments + "', '" + sampleimage_experiment_date + " " + sampleimage_experiment_time + ":00'); ";

    var imagedata_query = "INSERT INTO Image_Data (SampleID, MicroscopeID, MethodID, ImageType, ImageWidth, ImageHeight, ImageMemorySize, " +
    "LinkToImage, Validity, CreateTimeStamp, Comments) VALUES ((SELECT MAX(ID) FROM SampleTable), (SELECT ID FROM Microscope_Type WHERE MicroscopeName='" + 
    sample_microscope_data + "'), (SELECT ID FROM Detection_Method WHERE MethodName='" + sample_detection_method + "'), '" + image_type + "', " + 
    image_width + ", " + image_height + ", " + image_size + ", '" + image_load + "', " + sample_info_validity + ", '" + 
    sampleinfo_experiment_date + " " + sampleinfo_experiment_time + ":00', '" + image_comments + "'); ";

    var target_query = "INSERT INTO Target (SampleID, Theta, Phi, Rho, StatusID, Validity, CreateTimeStamp, Comments) VALUES (" +
    "(SELECT MAX(ID) FROM SampleTable), " + theta_angle + ", " + phi_angle + ", " + rho_angle + ", (SELECT ID FROM Target_Status WHERE Status='" +
    target_status + "'), " + target_image_validity + ", '" + targetinfo_experiment_date + " " + targetinfo_experiment_time + ":00', '" + target_comments + "'); ";

    var positiondata_query = "INSERT INTO Position_Data (TargetID, X, Y, Z, InPlaneAccuracy, OutOfPlaneAccuracy, Validity, CreateTimeStamp) VALUES (" +
    "(SELECT MAX(ID) FROM Target), " + target_x_position + ", " + target_y_position + ", " + target_z_position + ", " + inplane_accuracy + ", " + 
    out_of_plane_accuracy + ", " + target_validity + ", '" + targetpositioninfo_experiment_date + " " +  targetpositioninfo_experiment_time + ":00'); ";

    var xfeldata_query = "INSERT INTO XFEL_Data (TargetID, InstrumentID, CreateTimeStamp, Comments) VALUES ((SELECT MAX(ID) FROM Target), " + 
    "(SELECT ID FROM Instrument WHERE Name='" + instrument_used + "'), '" +  xfeldata_experiment_date + " " + xfeldata_experiment_time + "', '" + 
    target_instrument_comments + "'); ";
    
    var q = subframe_query + subframeeventtype_query + fiducial_query + overviewimage_query + roiimage_query + sampletable_query + 
    imagedata_query + target_query + positiondata_query + xfeldata_query;

    connection.query(q, function (error, result) {
        if (error) throw error;
        console.log(result);
        res.redirect("/");
    }); 
    //}
});

//app.get("/joke", function(req, res){
//    var joke = "Knock Knock ...";
//    //console.log("REQUESTED THE JOKE ROUTE!");
//    res.send(joke);
//});
// 
//app.get("/random_num", function(req, res){
//    var num = Math.floor(Math.random() * 10) + 1;
//    res.send("Your lucky number is: " + num);
//});

app.listen(8080, function () {
 console.log('App listening on port 8080!');
});

