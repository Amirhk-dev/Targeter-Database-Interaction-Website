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

    console.log(subframe_itemNamesData);

    //if (fiducialCounter < 4) {
    //    fiducialPoints.push(fiducialList[fiducialCounter]);
    //    fiducialCounter += 1;
    //}

    //res.render("manually_fiducial", {listFiducials:fiducialPoints});
    res.render("manually_fiducial");
});

app.post("/submitFiducialsInfoManually", function(req, res){
    fiducials_itemNamesData.Fid1Validity = req.body.fid1_validity;
    fiducials_itemNamesData.Fid1PositionName = req.body.fid1_position_name;
    fiducials_itemNamesData.Fid1XPosition = req.body.fid1_x_position;
    fiducials_itemNamesData.Fid1YPosition = req.body.fid1_y_position;
    fiducials_itemNamesData.Fid1ZPosition = req.body.fid1_z_position;

    fiducials_itemNamesData.Fid2Validity = req.body.fid2_validity;
    fiducials_itemNamesData.Fid2PositionName = req.body.fid2_position_name;
    fiducials_itemNamesData.Fid2XPosition = req.body.fid2_x_position;
    fiducials_itemNamesData.Fid2YPosition = req.body.fid2_y_position;
    fiducials_itemNamesData.Fid2ZPosition = req.body.fid2_z_position;

    fiducials_itemNamesData.Fid3Validity = req.body.fid3_validity;
    fiducials_itemNamesData.Fid3PositionName = req.body.fid3_position_name;
    fiducials_itemNamesData.Fid3XPosition = req.body.fid3_x_position;
    fiducials_itemNamesData.Fid3YPosition = req.body.fid3_y_position;
    fiducials_itemNamesData.Fid3ZPosition = req.body.fid3_z_position;

    fiducials_itemNamesData.Fid4Validity = req.body.fid4_validity;
    fiducials_itemNamesData.Fid4PositionName = req.body.fid4_position_name;
    fiducials_itemNamesData.Fid4XPosition = req.body.fid4_x_position;
    fiducials_itemNamesData.Fid4YPosition = req.body.fid4_y_position;
    fiducials_itemNamesData.Fid4ZPosition = req.body.fid4_z_position;

    console.log(fiducials_itemNamesData);

    res.render("manually_overview_image");
});

app.post("/submitOverviewImageManually", function(req, res){
    overviewimage_itemNamesData.OverviewImageValidity = req.body.overview_image_validity;
    overviewimage_itemNamesData.MicroscopeData = req.body.microscope_data;
    overviewimage_itemNamesData.DetectionMethod = req.body.detection_method;
    overviewimage_itemNamesData.OverviewImageLoad = req.body.overview_image_load;
    overviewimage_itemNamesData.OverviewImageExperimentDate = req.body.overviewimage_experiment_date;
    overviewimage_itemNamesData.OverviewImageExperimentTime = req.body.overviewimage_experiment_time;
    
    console.log(overviewimage_itemNamesData);

    res.render("manually_roi_image");
});

app.post("/submitROIImageManually", function(req, res){
    
    roi_itemNamesData.ROIImageValidity = req.body.roi_image_validity;
    roi_itemNamesData.MicroscopeData = req.body.microscope_data;
    roi_itemNamesData.DetectionMethod = req.body.detection_method;
    roi_itemNamesData.ROIOverviewImageLoad = req.body.roi_overviewimage_load;
    roi_itemNamesData.ROIExperimentDate = req.body.roi_experiment_date;
    roi_itemNamesData.ROIExperimentTime = req.body.roi_experiment_time;

    console.log(roi_itemNamesData);

    res.render("manually_sample_image");
});

app.post("/submitSampleImageManually", function(req, res){
    res.render("manually_target_data");
});

app.post("/submitAllData", function(req, res){
    let query = "SELECT COUNT(*) as count FROM Subframe";
    connection.query(query, function (err, results) {
        if (err)
            throw err;
        else
            var count = results[0].count;
        res.render("home", { data: count });
    });
});











app.post("/submitXMLFile", function(req, res){
    // Find count of Subframes in DB and Respond with that count
    var q = "SELECT COUNT(*) as count FROM Subframe; SELECT MAX(SerialNumber)+1 as max_sr FROM Subframe;";
    connection.query(q, function(err, results){
        if(err) throw err;
        var count = results[0][0].count;
        var max_sr = results[1][0].max_sr; // maximum serial number + 1
        //console.log(results[0][0].count);
        //console.log(results[1][0].max_sr);
        
        fs.readFile(req.body.xmlFile,function(err, data){
            xmlParser.parseString(data, function(err, result){
                //console.dir(result.experiment.subframe[0].GroupName);
                //console.dir(result.experiment.fiducials[0].fiducial1[0].Validity);
                //console.dir(result.experiment.fiducials[0].fiducial1);
                //console.log('Read finished!');
                // Looks for "home.ejs", and by default it is looking in "view"
                res.render("home_xml_data", {
                    data: count,
                    serialnumber: max_sr, 
                    groupname: result.experiment.subframe[0].GroupName,
                    subframetypename: result.experiment.subframe[0].SubframeTypeName,
                    facilityname: result.experiment.subframe[0].FacilityName,
                    sizex: result.experiment.subframe[0].SizeX,
                    sizey: result.experiment.subframe[0].SizeY,
                    comment: result.experiment.subframe[0].Comment,
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
                    fid4_zposition: result.experiment.fiducials[0].fiducial4[0].Z_position
                });       
            });
        });
    });
});



app.post("/submitExperimentXML", function(req, res){
    console.log(req.body);
    
    var GroupName = req.body.GroupName;
    var Subframe_Type = req.body.SubframeTypeName;
    var FacilityName = req.body.FacilityName;
    var SerialNumber = req.body.SerialNumber;
    var sizeX = req.body.SizeX;
    var sizeY = req.body.SizeY;
    var comments = req.body.Comment;
    var fid1_validity = req.body.fid1_Validity;
    var fid1_positionName = req.body.fid1_PositionName;
    var fid1_xposition = req.body.fid1_X_position;
    var fid1_yposition = req.body.fid1_Y_position;
    var fid1_zposition = req.body.fid1_Z_position;
    var fid2_validity = req.body.fid2_Validity;
    var fid2_positionName = req.body.fid2_PositionName;
    var fid2_xposition = req.body.fid2_X_position;
    var fid2_yposition = req.body.fid2_Y_position;
    var fid2_zposition = req.body.fid2_Z_position;
    var fid3_validity = req.body.fid3_Validity;
    var fid3_positionName = req.body.fid3_PositionName;
    var fid3_xposition = req.body.fid3_X_position;
    var fid3_yposition = req.body.fid3_Y_position;
    var fid3_zposition = req.body.fid3_Z_position;
    var fid4_validity = req.body.fid4_Validity;
    var fid4_positionName = req.body.fid4_PositionName;
    var fid4_xposition = req.body.fid4_X_position;
    var fid4_yposition = req.body.fid4_Y_position;
    var fid4_zposition = req.body.fid4_Z_position;

    var q = "INSERT INTO Subframe (GroupID, SubframeTypeID, FacilityID, SerialNumber, SizeX, SizeY, Comments)" +
    " VALUES ((SELECT ID FROM Group_Information WHERE GroupName='" + GroupName +
    "'), (SELECT ID FROM Subframe_Type WHERE Type='" + Subframe_Type + "'), " +
    "(SELECT ID FROM Facility WHERE CodeName='" + FacilityName + "'), " + 
    SerialNumber + ", " + sizeX + ", " +  sizeY + ", '" + comments + "'); " +
    "INSERT INTO Fiducial (SubFrameID, Validity, PositionID, X, Y, Z)" +
    " VALUES ((SELECT MAX(ID) FROM Subframe), " + fid1_validity + 
    ", (SELECT ID FROM Fiducial_Position WHERE PositionName='" + fid1_positionName +"'), " + 
    fid1_xposition + ", " + fid1_yposition + ", " + fid1_zposition + "); " +
    "INSERT INTO Fiducial (SubFrameID, Validity, PositionID, X, Y, Z)" +
    " VALUES ((SELECT MAX(ID) FROM Subframe), " + fid2_validity + 
    ", (SELECT ID FROM Fiducial_Position WHERE PositionName='" + fid2_positionName +"'), " + 
    fid2_xposition + ", " + fid2_yposition + ", " + fid2_zposition + "); " +
    "INSERT INTO Fiducial (SubFrameID, Validity, PositionID, X, Y, Z)" +
    " VALUES ((SELECT MAX(ID) FROM Subframe), " + fid3_validity + 
    ", (SELECT ID FROM Fiducial_Position WHERE PositionName='" + fid3_positionName +"'), " + 
    fid3_xposition + ", " + fid3_yposition + ", " + fid3_zposition + "); " +
    "INSERT INTO Fiducial (SubFrameID, Validity, PositionID, X, Y, Z)" +
    " VALUES ((SELECT MAX(ID) FROM Subframe), " + fid4_validity + 
    ", (SELECT ID FROM Fiducial_Position WHERE PositionName='" + fid4_positionName +"'), " + 
    fid4_xposition + ", " + fid4_yposition + ", " + fid4_zposition + "); ";

    console.log(q);
    
    connection.query(q, function (error, result) {
        if (error) throw error;
        console.log(result);
        res.redirect("/");
    });
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

