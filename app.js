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

var subframe_itemNamesData = {"SubframeValidity":"", "FacilityNameSelect":"", "SubframeTypeSelect":"",
    "GroupName":"", "SizeX":"", "SizeY":"", "SubframeComments":"", "SubframeExperimentDate":"", 
    "SubframeExperimentTime":"", "SubframeEventTypeName":""};

var fiducials_itemNamesData = {"Fid1Validity":"", "Fid1PositionName":"", "Fid1XPosition":"", 
    "Fid1YPosition":"", "Fid1ZPosition":"", "Fid2Validity":"", "Fid2PositionName":"", "Fid2XPosition":"", 
    "Fid2YPosition":"", "Fid2ZPosition":"", "Fid3Validity":"", "Fid3PositionName":"", "Fid3XPosition":"", 
    "Fid3YPosition":"", "Fid3ZPosition":"", "Fid4Validity":"", "Fid4PositionName":"", "Fid4XPosition":"", 
    "Fid4YPosition":"", "Fid4ZPosition":""};

var overviewimage_itemNamesData = {"OverviewImageValidity":"", "MicroscopeData":"", "DetectionMethod":"", 
    "OverviewImageLoad":"", "OverviewImageExperimentDate":"", "OverviewImageExperimentTime":""};

var roi_itemNamesData = {"ROIImageValidity":"", "MicroscopeData":"", "DetectionMethod":"", 
    "ROIOverviewImageLoad":"", "ROIExperimentDate":"", "ROIExperimentTime":""};

var sample_itemNamesData = {"SampleImageValidity":"", "PixelSizeX":"", "PixelSizeY":"", "BBXPosition":"", 
    "BBYPosition":"", "BBWidth":"", "BBHeight":"", "MaskImageLoad":"", "SampleimageExperimentDate":"", 
    "SampleimageExperimentTime":"", "SampleComments":"", "SampleInfoValidity":"", "SampleMicroscopeData":"", 
    "SampleDetectionMethod":"", "ROIImageLoad":"", "ImageType":"", "ImageWidth":"", "ImageHeight":"", 
    "ImageSize":"", "ImageComments":"", "ImageLoad":"", "SampleinfoExperimentDate":"", "SampleinfoExperimentTime":""};

var target_itemNamesData = {"TargetImageValidity":"", "TargetStatus":"", "ThetaAngle":"", "PhiAngle":"", 
    "RhoAngle":"", "TargetinfoExperimentDate":"", "TargetinfoExperimentTime":"", "TargetComments":"", 
    "TargetValidity":"", "TargetXPosition":"", "TargetYPosition":"", "TargetZPosition":"", "InplaneAccuracy":"", 
    "OutOfPlaneAccuracy":"", "TargetpositioninfoExperimentDate":"", "TargetpositioninfoExperimentTime":"", 
    "InstrumentUsed":"", "XFELDataExperimentDate":"", "XFELDataExperimentTime":"", "TargetInstrumentComments":""};

var xml_data = [];

function assignTheValues(value) {
    xml_data = value;
}

function checkEmpty(term, page_name) {
    var result = false;

    if (page_name === "subframe"){
        value_0 = (term.SubframeValidity===false ? true:false);
        value_1 = (term.FacilityNameSelect==="Choose..." ? true:false);
        value_2 = (term.SubframeTypeSelect==="Choose..." ? true:false);
        value_3 = (term.GroupName==="Choose..." ? true:false);
        value_4 = (term.SizeX==='' ? true:false);
        value_5 = (term.SizeY==='' ? true:false);
        value_6 = (term.SubframeExperimentDate==='' ? true:false);
        value_7 = (term.SubframeExperimentTime==='' ? true:false);
        value_8 = (term.SubframeEventTypeName==="Choose..." ? true:false);
        result = (value_0 | value_1 | value_2 | value_3 | value_4 | value_5 | value_6 | value_7 | value_8);
    } else if (page_name === "fiducial"){
        if ((term.Fid1Validity + term.Fid2Validity + term.Fid3Validity + term.Fid4Validity) < 3) {
            result = true;
        }else {
            value_0 = (term.Fid1PositionName === 'Choose...' ? true:false);
            value_1 = (term.Fid2PositionName === 'Choose...' ? true:false);
            value_2 = (term.Fid3PositionName === 'Choose...' ? true:false);
            value_3 = (term.Fid4PositionName === 'Choose...' ? true:false);
            value_4 = (term.Fid1XPosition === '' ? true:false);
            value_5 = (term.Fid1YPosition === '' ? true:false);
            value_6 = (term.Fid1ZPosition === '' ? true:false);
            value_7 = (term.Fid2XPosition === '' ? true:false);
            value_8 = (term.Fid2YPosition === '' ? true:false);
            value_9 = (term.Fid2ZPosition === '' ? true:false);
            value_10 = (term.Fid3XPosition === '' ? true:false);
            value_11 = (term.Fid3YPosition === '' ? true:false);
            value_12 = (term.Fid3ZPosition === '' ? true:false);
            value_13 = (term.Fid4XPosition === '' ? true:false);
            value_14 = (term.Fid4YPosition === '' ? true:false);
            value_15 = (term.Fid4ZPosition === '' ? true:false);
            result = (value_0 | value_1 | value_2 | value_3 | value_4 | value_5 | value_6 | value_7 | value_8 | 
                value_9 | value_10 | value_11 | value_12 | value_13 | value_14 | value_15);
        }
    }  else if (page_name === "overviewimage") {
        value_0 = (term.OverviewImageValidity===false ? true:false);
        value_1 = (term.MicroscopeData==="Choose..." ? true:false);
        value_2 = (term.DetectionMethod==="Choose..." ? true:false);
        value_3 = (term.OverviewImageLoad==='' ? true:false);
        value_4 = (term.OverviewImageExperimentDate==='' ? true:false);
        value_5 = (term.OverviewImageExperimentTime==='' ? true:false);
        result = (value_0 | value_1 | value_2 | value_3 | value_4 | value_5);
    } else if (page_name === "roi") {
        value_0 = (term.ROIImageValidity===false ? true:false);
        value_1 = (term.MicroscopeData==="Choose..." ? true:false);
        value_2 = (term.DetectionMethod==="Choose..." ? true:false);
        value_3 = (term.ROIOverviewImageLoad==='' ? true:false);
        value_4 = (term.ROIExperimentDate==='' ? true:false);
        value_5 = (term.ROIExperimentTime==='' ? true:false);
        result = (value_0 | value_1 | value_2 | value_3 | value_4 | value_5);
    } else if (page_name==="sampleimage"){
        value_0 = (term.SampleImageValidity===false ? true:false);
        value_1 = (term.PixelSizeX==='' ? true:false);
        value_2 = (term.PixelSizeY==='' ? true:false);
        value_3 = (term.BBXPosition==='' ? true:false);
        value_4 = (term.BBYPosition==='' ? true:false);
        value_5 = (term.BBWidth==='' ? true:false);
        value_6 = (term.BBHeight==='' ? true:false);
        value_7 = (term.MaskImageLoad==='' ? true:false);
        value_8 = (term.SampleimageExperimentDate==='' ? true:false);
        value_9 = (term.SampleimageExperimentTime==='' ? true:false);
        value_10 = (term.SampleInfoValidity===false ? true:false);
        value_11 = (term.SampleMicroscopeData==="Choose..." ? true:false);
        value_12 = (term.SampleDetectionMethod==="Choose..." ? true:false);
        value_13 = (term.ROIImageLoad==='' ? true:false);
        value_14 = (term.ImageType==="Choose..." ? true:false);
        value_15 = (term.ImageWidth==='' ? true:false);
        value_16 = (term.ImageHeight==='' ? true:false);
        value_17 = (term.ImageSize==='' ? true:false);
        value_18 = (term.ImageLoad==='' ? true:false);
        value_19 = (term.SampleinfoExperimentDate==='' ? true:false);
        value_20 = (term.SampleinfoExperimentTime==='' ? true:false);
        result = (value_0 | value_1 | value_2 | value_3 | value_4 | value_5 | value_6 | value_7 | value_8 | 
            value_9 | value_10 | value_11 | value_12 | value_13 | value_14 | value_15 | value_16 | value_17 |
            value_18 | value_19 | value_20);
    } else if (page_name==="targetdata") {
        value_0 = (term.TargetImageValidity===false ? true:false);
        value_1 = (term.TargetStatus==="Choose..." ? true:false);
        value_2 = (term.ThetaAngle==='' ? true:false);
        value_3 = (term.PhiAngle==='' ? true:false);
        value_4 = (term.RhoAngle==='' ? true:false);
        value_5 = (term.TargetinfoExperimentDate==='' ? true:false);
        value_6 = (term.TargetinfoExperimentTime==='' ? true:false);
        value_7 = (term.TargetValidity===false ? true:false);
        value_8 = (term.TargetXPosition==='' ? true:false);
        value_9 = (term.TargetYPosition==='' ? true:false);
        value_10 = (term.TargetZPosition==='' ? true:false);
        value_11 = (term.InplaneAccuracy==='' ? true:false);
        value_12 = (term.OutOfPlaneAccuracy==='' ? true:false);
        value_13 = (term.TargetpositioninfoExperimentDate==='' ? true:false);
        value_14 = (term.TargetpositioninfoExperimentTime==='' ? true:false);
        value_15 = (term.InstrumentUsed==="Choose..." ? true:false);
        value_16 = (term.XFELDataExperimentDate==='' ? true:false);
        value_17 = (term.XFELDataExperimentTime==='' ? true:false);
        result = (value_0 | value_1 | value_2 | value_3 | value_4 | value_5 | value_6 | value_7 | value_8 | 
            value_9 | value_10 | value_11 | value_12 | value_13 | value_14 | value_15 | value_16 | value_17);
    }

    return result;
}

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static(__dirname + "/public"));
app.use(express.static(__dirname + "/imgs"));    

app.get("/", function(req, res){
    let query = "SELECT COUNT(*) as count FROM Subframe";
    connection.query(query, function(err, results){
        if(err) 
            throw err;
        else            
            var count = results[0].count;
        res.render("home", {data:count}); 
    });
});

app.post("/submitDataManually", function(req, res){
    let query = "SELECT COUNT(*) as count FROM Subframe; SELECT MAX(SerialNumber)+1 as max_sr FROM Subframe;";
    connection.query(query, function(err, results){
        if(err) 
            throw err;
        else
            var count = results[0][0].count;
        var max_sr = results[1][0].max_sr;        
        res.render("home_manually_subframe", {data: count, serialnumber: max_sr});
    });
});

app.post("/submitSubframeInfoManually", function(req, res){
    subframe_itemNamesData.SubframeValidity = (req.body.subframe_validity ? true:false);
    subframe_itemNamesData.FacilityNameSelect = req.body.facility_name_select;
    subframe_itemNamesData.SubframeTypeSelect = req.body.subframe_type_select;
    subframe_itemNamesData.GroupName = req.body.group_name;
    subframe_itemNamesData.SizeX = req.body.size_x;
    subframe_itemNamesData.SizeY = req.body.size_y;
    subframe_itemNamesData.SubframeComments = req.body.subframe_comments;
    subframe_itemNamesData.SubframeExperimentDate = req.body.subframe_experiment_date;
    subframe_itemNamesData.SubframeExperimentTime = req.body.subframe_experiment_time;
    subframe_itemNamesData.SubframeEventTypeName = req.body.subframe_event_type_name;
    
    if (checkEmpty(subframe_itemNamesData, "subframe")) {
        let query = "SELECT COUNT(*) as count FROM Subframe; SELECT MAX(SerialNumber)+1 as max_sr FROM Subframe;";
        connection.query(query, function(err, results){
            if(err) 
                throw err;
            else
                var count = results[0][0].count;
            var max_sr = results[1][0].max_sr;        
            res.render("home_manually_subframe", {data: count, serialnumber: max_sr});
        });
    } else {
        res.render("manually_fiducial");
    }    
});

app.post("/submitFiducialsInfoManually", function(req, res){
    fiducials_itemNamesData.Fid1Validity = (req.body.fid1_validity ? true:false);
    fiducials_itemNamesData.Fid1PositionName = req.body.fid1_position_name;
    fiducials_itemNamesData.Fid1XPosition = req.body.fid1_x_position;
    fiducials_itemNamesData.Fid1YPosition = req.body.fid1_y_position;
    fiducials_itemNamesData.Fid1ZPosition = req.body.fid1_z_position;

    fiducials_itemNamesData.Fid2Validity = (req.body.fid2_validity ? true:false);
    fiducials_itemNamesData.Fid2PositionName = req.body.fid2_position_name;
    fiducials_itemNamesData.Fid2XPosition = req.body.fid2_x_position;
    fiducials_itemNamesData.Fid2YPosition = req.body.fid2_y_position;
    fiducials_itemNamesData.Fid2ZPosition = req.body.fid2_z_position;

    fiducials_itemNamesData.Fid3Validity = (req.body.fid3_validity ? true:false);
    fiducials_itemNamesData.Fid3PositionName = req.body.fid3_position_name;
    fiducials_itemNamesData.Fid3XPosition = req.body.fid3_x_position;
    fiducials_itemNamesData.Fid3YPosition = req.body.fid3_y_position;
    fiducials_itemNamesData.Fid3ZPosition = req.body.fid3_z_position;

    fiducials_itemNamesData.Fid4Validity = (req.body.fid4_validity ? true:false);
    fiducials_itemNamesData.Fid4PositionName = req.body.fid4_position_name;
    fiducials_itemNamesData.Fid4XPosition = req.body.fid4_x_position;
    fiducials_itemNamesData.Fid4YPosition = req.body.fid4_y_position;
    fiducials_itemNamesData.Fid4ZPosition = req.body.fid4_z_position;

    if (checkEmpty(fiducials_itemNamesData, "fiducial")) {
        res.render("manually_fiducial");
    } else {
        res.render("manually_overview_image");
    }
});

app.post("/submitOverviewImageManually", function(req, res){
    overviewimage_itemNamesData.OverviewImageValidity = (req.body.overview_image_validity ? true:false);
    overviewimage_itemNamesData.MicroscopeData = req.body.microscope_data;
    overviewimage_itemNamesData.DetectionMethod = req.body.detection_method;
    overviewimage_itemNamesData.OverviewImageLoad = req.body.overview_image_load;
    overviewimage_itemNamesData.OverviewImageExperimentDate = req.body.overviewimage_experiment_date;
    overviewimage_itemNamesData.OverviewImageExperimentTime = req.body.overviewimage_experiment_time;
    
    if (checkEmpty(overviewimage_itemNamesData, "overviewimage")) {
        res.render("manually_overview_image");
    } else {
        res.render("manually_roi_image");
    }
});

app.post("/submitROIImageManually", function(req, res){
    
    roi_itemNamesData.ROIImageValidity = (req.body.roi_image_validity ? true:false);
    roi_itemNamesData.MicroscopeData = req.body.microscope_data;
    roi_itemNamesData.DetectionMethod = req.body.detection_method;
    roi_itemNamesData.ROIOverviewImageLoad = req.body.roi_overviewimage_load;
    roi_itemNamesData.ROIExperimentDate = req.body.roi_experiment_date;
    roi_itemNamesData.ROIExperimentTime = req.body.roi_experiment_time;
    
    if (checkEmpty(roi_itemNamesData, "roi")) {
        res.render("manually_roi_image");
    } else {
        res.render("manually_sample_image");
    }
});

app.post("/submitSampleImageManually", function(req, res){
    sample_itemNamesData.SampleImageValidity = (req.body.sample_image_validity ? true:false);
    sample_itemNamesData.PixelSizeX = req.body.pixel_size_x;
    sample_itemNamesData.PixelSizeY = req.body.pixel_size_y;
    sample_itemNamesData.BBXPosition = req.body.BB_x_position;
    sample_itemNamesData.BBYPosition = req.body.BB_y_position;
    sample_itemNamesData.BBWidth = req.body.BB_width;
    sample_itemNamesData.BBHeight = req.body.BB_height;
    sample_itemNamesData.MaskImageLoad = req.body.mask_image_load;
    sample_itemNamesData.SampleimageExperimentDate = req.body.sampleimage_experiment_date;
    sample_itemNamesData.SampleimageExperimentTime = req.body.sampleimage_experiment_time;
    sample_itemNamesData.SampleComments = req.body.sample_comments;
    sample_itemNamesData.SampleInfoValidity = (req.body.sample_info_validity ? true:false);
    sample_itemNamesData.SampleMicroscopeData = req.body.sample_microscope_data;
    sample_itemNamesData.SampleDetectionMethod = req.body.sample_detection_method;
    sample_itemNamesData.ROIImageLoad = req.body.roi_image_load;
    sample_itemNamesData.ImageType = req.body.image_type;
    sample_itemNamesData.ImageWidth = req.body.image_width;
    sample_itemNamesData.ImageHeight = req.body.image_height;
    sample_itemNamesData.ImageSize = req.body.image_size;
    sample_itemNamesData.ImageComments = req.body.image_comments;
    sample_itemNamesData.ImageLoad = req.body.image_load;
    sample_itemNamesData.SampleinfoExperimentDate = req.body.sampleinfo_experiment_date;
    sample_itemNamesData.SampleinfoExperimentTime = req.body.sampleinfo_experiment_time;

    console.log(sample_itemNamesData);

    if (checkEmpty(sample_itemNamesData, "sampleimage")) {
        res.render("manually_sample_image");
    } else {
        res.render("manually_target_data");
    }
});

app.post("/submitAllData", function(req, res){
    target_itemNamesData.TargetImageValidity = (req.body.target_image_validity ? true:false);
    target_itemNamesData.TargetStatus = req.body.target_status;
    target_itemNamesData.ThetaAngle = req.body.theta_angle;
    target_itemNamesData.PhiAngle = req.body.phi_angle;
    target_itemNamesData.RhoAngle = req.body.rho_angle;
    target_itemNamesData.TargetinfoExperimentDate = req.body.targetinfo_experiment_date;
    target_itemNamesData.TargetinfoExperimentTime = req.body.targetinfo_experiment_time;
    target_itemNamesData.TargetComments = req.body.target_comments;
    target_itemNamesData.TargetValidity = (req.body.target_validity ? true:false);
    target_itemNamesData.TargetXPosition = req.body.target_x_position;
    target_itemNamesData.TargetYPosition = req.body.target_y_position;
    target_itemNamesData.TargetZPosition = req.body.target_z_position;
    target_itemNamesData.InplaneAccuracy = req.body.inplane_accuracy;
    target_itemNamesData.OutOfPlaneAccuracy = req.body.out_of_plane_accuracy;
    target_itemNamesData.TargetpositioninfoExperimentDate = req.body.targetpositioninfo_experiment_date;
    target_itemNamesData.TargetpositioninfoExperimentTime = req.body.targetpositioninfo_experiment_time;
    target_itemNamesData.InstrumentUsed = req.body.instrument_used;
    target_itemNamesData.XFELDataExperimentDate = req.body.xfeldata_experiment_date;
    target_itemNamesData.XFELDataExperimentTime = req.body.xfeldata_experiment_time;
    target_itemNamesData.TargetInstrumentComments = req.body.target_instrument_comments;
    
    console.log(target_itemNamesData);

    if (checkEmpty(target_itemNamesData, "targetdata")) {
        res.render("manually_target_data");
    } else {
        let query = "SELECT COUNT(*) as count FROM Subframe";
        connection.query(query, function (err, results) {
            if (err)
                throw err;
            else
                var count = results[0].count;
            res.render("home", { data: count });
        });
    }
});

app.post("/submitXMLFile", function(req, res){
    // Find count of Subframes in DB and Respond with that count
    var q = "SELECT COUNT(*) as count FROM Subframe; SELECT MAX(SerialNumber)+1 as max_sr FROM Subframe;";
    connection.query(q, function(err, results){
        if(err) throw err;
        var count = results[0][0].count;
        var max_sr = results[1][0].max_sr; // maximum serial number + 1
        
        fs.readFile(req.body.xmlFile,function(err, data){
            xml_data = data;
            xmlParser.parseString(data, function(err, result){
                console.dir(result);
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
                    roi1_validity: result.experiment.roiimages[0].roi1[0].Validity,
                    roi1_microscopetype: result.experiment.roiimages[0].roi1[0].MicroscopeType,
                    roi1_detectionmethod: result.experiment.roiimages[0].roi1[0].DetectionMethod,
                    roi1_imageload: result.experiment.roiimages[0].roi1[0].ImageLoad,
                    roi1_experimentdate: result.experiment.roiimages[0].roi1[0].ExperimentDate,
                    roi1_experimenttime: result.experiment.roiimages[0].roi1[0].ExperimentTime,
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
                    sample1_roiimageload: result.experiment.sampleimages[0].sample1[0].ROIImageLoad,
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
                    target1_experimenttime: result.experiment.targets[0].target1[0].ExperimentDate,
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
    console.log(req.body);
    
    console.log(xml_data);
    //var GroupName = req.body.GroupName;
    //var Subframe_Type = req.body.SubframeTypeName;
    //var FacilityName = req.body.FacilityName;
    //var SerialNumber = req.body.SerialNumber;
    //var sizeX = req.body.SizeX;
    //var sizeY = req.body.SizeY;
    //var comments = req.body.Comment;
    //var fid1_validity = req.body.fid1_Validity;
    //var fid1_positionName = req.body.fid1_PositionName;
    //var fid1_xposition = req.body.fid1_X_position;
    //var fid1_yposition = req.body.fid1_Y_position;
    //var fid1_zposition = req.body.fid1_Z_position;
    //var fid2_validity = req.body.fid2_Validity;
    //var fid2_positionName = req.body.fid2_PositionName;
    //var fid2_xposition = req.body.fid2_X_position;
    //var fid2_yposition = req.body.fid2_Y_position;
    //var fid2_zposition = req.body.fid2_Z_position;
    //var fid3_validity = req.body.fid3_Validity;
    //var fid3_positionName = req.body.fid3_PositionName;
    //var fid3_xposition = req.body.fid3_X_position;
    //var fid3_yposition = req.body.fid3_Y_position;
    //var fid3_zposition = req.body.fid3_Z_position;
    //var fid4_validity = req.body.fid4_Validity;
    //var fid4_positionName = req.body.fid4_PositionName;
    //var fid4_xposition = req.body.fid4_X_position;
    //var fid4_yposition = req.body.fid4_Y_position;
    //var fid4_zposition = req.body.fid4_Z_position;

    //var q = "INSERT INTO Subframe (GroupID, SubframeTypeID, FacilityID, SerialNumber, SizeX, SizeY, Comments)" +
    //" VALUES ((SELECT ID FROM Group_Information WHERE GroupName='" + GroupName +
    //"'), (SELECT ID FROM Subframe_Type WHERE Type='" + Subframe_Type + "'), " +
    //"(SELECT ID FROM Facility WHERE CodeName='" + FacilityName + "'), " + 
    //SerialNumber + ", " + sizeX + ", " +  sizeY + ", '" + comments + "'); " +
    //"INSERT INTO Fiducial (SubFrameID, Validity, PositionID, X, Y, Z)" +
    //" VALUES ((SELECT MAX(ID) FROM Subframe), " + fid1_validity + 
    //", (SELECT ID FROM Fiducial_Position WHERE PositionName='" + fid1_positionName +"'), " + 
    //fid1_xposition + ", " + fid1_yposition + ", " + fid1_zposition + "); " +
    //"INSERT INTO Fiducial (SubFrameID, Validity, PositionID, X, Y, Z)" +
    //" VALUES ((SELECT MAX(ID) FROM Subframe), " + fid2_validity + 
    //", (SELECT ID FROM Fiducial_Position WHERE PositionName='" + fid2_positionName +"'), " + 
    //fid2_xposition + ", " + fid2_yposition + ", " + fid2_zposition + "); " +
    //"INSERT INTO Fiducial (SubFrameID, Validity, PositionID, X, Y, Z)" +
    //" VALUES ((SELECT MAX(ID) FROM Subframe), " + fid3_validity + 
    //", (SELECT ID FROM Fiducial_Position WHERE PositionName='" + fid3_positionName +"'), " + 
    //fid3_xposition + ", " + fid3_yposition + ", " + fid3_zposition + "); " +
    //"INSERT INTO Fiducial (SubFrameID, Validity, PositionID, X, Y, Z)" +
    //" VALUES ((SELECT MAX(ID) FROM Subframe), " + fid4_validity + 
    //", (SELECT ID FROM Fiducial_Position WHERE PositionName='" + fid4_positionName +"'), " + 
    //fid4_xposition + ", " + fid4_yposition + ", " + fid4_zposition + "); ";

    //console.log(q);
    
    //connection.query(q, function (error, result) {
    //    if (error) throw error;
    //    console.log(result);
    //    res.redirect("/");
    //});
    
    
    
    //console.log(req.body);
    //console.log(req.body);
    //console.log("POST REQUEST SENT TO /SUBMITEXPERIMENT email is " + req.body.email); 
    // "email" is the same name used in the home.ejs file 
});

app.get("/joke", function(req, res){
    var joke = "Knock Knock ...";
    //console.log("REQUESTED THE JOKE ROUTE!");
    res.send(joke);
});
 
app.get("/random_num", function(req, res){
    var num = Math.floor(Math.random() * 10) + 1;
    res.send("Your lucky number is: " + num);
});

app.listen(8080, function () {
 console.log('App listening on port 8080!');
});

