require('dotenv').config();
const express = require('express');
const app = express();
const bodyParser = require("body-parser");
const ejs = require("ejs");
const passport = require('passport');
const database_connect = require(__dirname + "/database_connection.js");
const variables = require('./public/app_variables');
const functions = require('./public/app_functions');

var LocalStrategy   = require('passport-local').Strategy;
let mysql = require('mysql'); 
let connection = mysql.createConnection({
    host	            : process.env.HOST_NAME, 
    user	            : process.env.DB_USER,
    database            : process.env.DB_NAME,
    password            : process.env.DB_PWD,
    multipleStatements  : true
});

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static(__dirname + "/public"));
app.use(express.static(__dirname + "/imgs"));    
//#############################################################################
// load home page
app.get("/", function(req, res){
    let query = "SELECT COUNT(*) as count FROM Subframe_Table";
    connection.query(query, function(err, results){
        if(err) 
            throw err;
        else            
            var count = results[0].count;
            serial_number = count + 1;
        res.render("home", {data:count}); 
    });
});
//#############################################################################
// create subframe page
app.post("/createSubframe", function(req, res){ 
    console.log('\nthe user attempts to create a subframe...')
    res.render("create_subframe/get_subframe_id");      
});

// create subframe on the databae
app.post("/createSubframeOnDatabase", function(req, res){
    console.log('\nprocessing the request (connecting to the database)...');
    FacilityName = req.body.facility_name_select;
    SubframeType = req.body.subframe_type_select;

    var found_serialnumber = "SELECT MAX(SerialNumber)+1 as serialnumber " +
    "FROM Subframe_Table WHERE SubframeTypeID=(SELECT ID FROM " +
    "SubframeType_Table WHERE TypeName='" + SubframeType +
    "') AND FacilityID=(SELECT ID FROM Facility_Table WHERE CodeName='" +
    FacilityName + "');"
    
    var q = found_serialnumber; 

    connection.query(q, function (error, result) {
        if (error)
            throw error;
        
        serial_number = result[0].serialnumber;

        if (serial_number===null)
            serial_number = 1;

        var concat_zeros = 6 - serial_number.toString().length;
        if(concat_zeros>0){
            serial_number_text = serial_number.toString();
            for(let i=0; i<concat_zeros; i++){
                serial_number_text = '0' + serial_number_text;
            }
        }

        var getFacilityID_query = "SELECT ID as facilityid FROM Facility_Table " +
        "WHERE CodeName='" + FacilityName + "'; ";
        var getSubframeTypeID_query = "SELECT ID as subframetypeid FROM " +
        "SubframeType_Table WHERE TypeName='" + SubframeType + "'; ";
        var createSubframeEntry = "INSERT INTO Subframe_Table (FacilityID, " +
        "SubframeTypeID, SerialNumber, Validity) VALUES ((" + 
        "SELECT ID as facilityid FROM Facility_Table WHERE CodeName='" +
        FacilityName + "'), (SELECT ID as subframetypeid FROM SubframeType_Table" +
        " WHERE TypeName='" + SubframeType + "'), " + serial_number + ", 1);"    
    
        q = getFacilityID_query + getSubframeTypeID_query + createSubframeEntry;
        connection.query(q, function (error, result) { 
            var facilityID = result[0][0].facilityid;
            var subframeTypeID = result[1][0].subframetypeid;
            var finalID = FacilityName + SubframeType + serial_number_text;
            res.render("create_subframe/show_subframe_id",
                        {
                            serial_number,
                            FacilityName,
                            SubframeType,
                            finalID
                        }); 
    });
})});

app.post("/finishCreatingSubframeEntry", function(req, res){
    console.log('\nthe user created a subframe...')
    res.redirect("/");
});
//#############################################################################
// view tables and their content in the database
app.post("/viewDBTables", function(req, res){
    console.log('\nthe user attempts to view the tables and their entries...');
    
    let q = "SHOW TABLES";
    connection.query(q, function(error, result){
        if (error)
            throw error;
        
        all_queries = "";
        for(let index=0; index < result.length; index++){
            if (index==0)
                all_queries += "SHOW TABLES; SELECT * FROM " +
                                result[index]['Tables_in_euxfeltargets_dev'] + 
                                "; ";
            else
                all_queries += "SELECT * FROM " +
                                result[index]['Tables_in_euxfeltargets_dev'] +
                                "; ";
        }

        connection.query(all_queries, function(error, result){
            if (error)
                throw error;
                
            res.render("view_tables_in_db/view_tables",
                            {
                                result
                            });
        });
    });
});
//#############################################################################
// try chatbot
app.post("/chatbot", function(req, res){
    console.log('\nthe user attempts to chat with the system...');
    console.log('\nrequires billing OpenAI to get free OpenAI-Key...');
    res.redirect('/');
});
//#############################################################################
// query the database
app.post("/database_query", function(req, res){
    console.log('\nthe user attempts to query the database...');
    let Subframe_IDs = [];
    res.render("query_db/query_the_database", {
        Subframe_IDs,
    });
});

// get subframe ids
app.post("/get_subframe_ids", function(req, res){
    console.log('\nthe user attempts to know the Subframe IDs...');
    let q = "SELECT * FROM Subframe_Table";

    connection.query(q, function(error, result){
        if (error)
            throw error;
        
        q = "";
        serial_numbers = [];
        for(let i=0; i < result.length; i++){
            q += "SELECT CodeName FROM Facility_Table WHERE ID=" +
                    result[i]['FacilityID'] + "; ";
            q += "SELECT TypeName FROM SubframeType_Table WHERE ID=" +
                    result[i]['SubframeTypeID'] + "; ";
            serial_numbers.push(result[i]['SerialNumber']);
        }
        number_of_items = result.length;

        connection.query(q, function(error, result){
            Subframe_IDs = [];
            for(i=0; i < result.length; i+=2) {
                subframe_id = "";
                subframe_id += result[i][0]['CodeName'];
                subframe_id += result[i+1][0]['TypeName'];
                
                let padd_length = 6-serial_numbers[i/2].toString().length;
                serial_number_str = serial_numbers[i/2].toString();
                for (let j=0; j < padd_length; j++){
                    serial_number_str = "0" + serial_number_str;
                }

                subframe_id += serial_number_str;
                Subframe_IDs.push(subframe_id);
            }

            res.render("query_db/query_the_database", {
                Subframe_IDs,
            });
        });
    });
});

//#############################################################################


























app.post("/submitDataManually", function(req, res){
    res.render("home_manually_subframe_fiducials");
});

app.post("/submitSubframeFiducialsInfoManually", function(req, res){
    variables.subframe_fiducials_itemNamesData.subframe_fid1_validity = (req.body.subframe_fid1_validity ? true:false);
    variables.subframe_fiducials_itemNamesData.subframe_fid1_position_name = req.body.subframe_fid1_position_name;
    variables.subframe_fiducials_itemNamesData.subframe_fid1_x_position = req.body.subframe_fid1_x_position;
    variables.subframe_fiducials_itemNamesData.subframe_fid1_y_position = req.body.subframe_fid1_y_position;
    variables.subframe_fiducials_itemNamesData.subframe_fid1_z_position = req.body.subframe_fid1_z_position;
    variables.subframe_fiducials_itemNamesData.subframe_fid1_date = req.body.subframe_fid1_date;
    variables.subframe_fiducials_itemNamesData.subframe_fid1_time = req.body.subframe_fid1_time;
    variables.subframe_fiducials_itemNamesData.subframe_fid2_validity = (req.body.subframe_fid2_validity ? true:false);
    variables.subframe_fiducials_itemNamesData.subframe_fid2_position_name = req.body.subframe_fid2_position_name;
    variables.subframe_fiducials_itemNamesData.subframe_fid2_x_position = req.body.subframe_fid2_x_position;
    variables.subframe_fiducials_itemNamesData.subframe_fid2_y_position = req.body.subframe_fid2_y_position;
    variables.subframe_fiducials_itemNamesData.subframe_fid2_z_position = req.body.subframe_fid2_z_position;
    variables.subframe_fiducials_itemNamesData.subframe_fid2_date = req.body.subframe_fid2_date;
    variables.subframe_fiducials_itemNamesData.subframe_fid2_time = req.body.subframe_fid2_time;
    variables.subframe_fiducials_itemNamesData.subframe_fid3_validity = (req.body.subframe_fid3_validity ? true:false);
    variables.subframe_fiducials_itemNamesData.subframe_fid3_position_name = req.body.subframe_fid3_position_name;
    variables.subframe_fiducials_itemNamesData.subframe_fid3_x_position = req.body.subframe_fid3_x_position;
    variables.subframe_fiducials_itemNamesData.subframe_fid3_y_position = req.body.subframe_fid3_y_position;
    variables.subframe_fiducials_itemNamesData.subframe_fid3_z_position = req.body.subframe_fid3_z_position;
    variables.subframe_fiducials_itemNamesData.subframe_fid3_date = req.body.subframe_fid3_date;
    variables.subframe_fiducials_itemNamesData.subframe_fid3_time = req.body.subframe_fid3_time;

    if (functions.checkEmpty(variables.subframe_fiducials_itemNamesData, "subframe_fids")) {
            res.render("home_manually_subframe_fiducials");
    } else { 
        res.render("home_manually_subframe");
    }  
});

app.get("/editTables", function(req, res){
    let query0 = "SELECT * FROM GroupInformation_Table; ";
    let query1 = "SELECT * FROM Facility_Table; ";
    let query2 = "SELECT * FROM SubframeType_Table; ";
    let query3 = "SELECT * FROM DeviceList_Table; ";
    let query31 = "SELECT * FROM DeviceType_Table; ";
    let query4 = "SELECT * FROM ROIType_Table; ";
    let query5 = "SELECT * FROM DetectionMethod_Table; ";
    let query6 = "SELECT * FROM EventType_Table; ";
    let query7 = "SELECT * FROM FiducialPosition_Table; ";

    let query = query0 + query1 + query2 + query3 + query31 + query4 + query5 + query6 + query7;

    connection.query(query, function(err, results){
        if(err) 
            throw err;
            
        res.render("edit_tables", {listTitle0: "Group Information", newListItems0: results[0],
                                   listTitle1: "Facility", newListItems1: results[1],
                                   listTitle2: "Subframe Type", newListItems2: results[2],
                                   listTitle3: "Device List", newListItems3: results[3],
                                   listTitle4: "Device Type", newListItems4: results[4],
                                   listTitle5: "ROI Type", newListItems5: results[5],
                                   listTitle6: "Detection Method", newListItems6: results[6],
                                   listTitle7: "Event Type", newListItems7: results[7],
                                   listTitle8: "Fiducial Position", newListItems8: results[8]}); 
    });

});

app.post("/addToTable", function(req, res){
    console.log(req.body);

    var table_name = req.body.list;

    if(table_name==="Group Information")
        q = "INSERT INTO GroupInformation_Table (GroupName, Comments) VALUES ('" + req.body.groupinfo_name + "', '" + req.body.groupinfo_comment + "'); ";
    else if(table_name==="Facility")
        q = "INSERT INTO Facility_Table (Name, CodeName, LinkOfFacility, Comments) VALUES ('" + req.body.name + "', '" + req.body.code_name + "', '" +
        req.body.link_of_facility + "', '" + req.body.comments  + "'); ";
    else if(table_name==="Subframe Type")
        q = "INSERT INTO SubframeType_Table (TypeName, SizeX, SizeY, Comments) VALUES ('" + req.body.type_name + "', '" + req.body.size_x + 
        "', '" + req.body.size_y + "', '" + req.body.comment + "'); ";    
    else if(table_name==="Device List")
        q = "INSERT INTO DeviceList_Table (DeviceTypeID, VendorName, ModelName, Comments) VALUES (" + req.body.vendor_name + ", " + 
        req.body.model_name + ", '" + req.body.comment + "'); ";
    else if(table_name==="ROI Type")
        q = "INSERT INTO GroupInformation_Table (GroupName, Comments) VALUES (" + req.body.name + ", '" + req.body.comment + "'); ";
    else if(table_name==="Detection Method")
        q = "INSERT INTO DetectionMethod_Table (MethodName, MethodDescription) VALUES (" + req.body.method_name + ", '" + req.body.method_description + "'); ";
    else if(table_name==="Event Type"){
        var checkbox_subframe = (req.body.checkbox_subframe==='on' ? 1:0);
        var checkbox_roi = (req.body.checkbox_roi==='on' ? 1:0);
        var checkbox_sample = (req.body.checkbox_sample==='on' ? 1:0);
        var checkbox_target = (req.body.checkbox_target==='on' ? 1:0);

        q = "INSERT INTO EventType_Table (EventType, ForSubframe, ForROI, ForSample, ForTarget, Comments) VALUES (" + req.body.event_type + 
        ", " + checkbox_subframe + ", " + checkbox_roi + ", " + checkbox_sample + ", " + checkbox_target + ", '" + req.body.comment + "'); ";
    }
    else if(table_name==="Fiducial Position")
        q = "INSERT INTO FiducialPosition_Table (PositionName) VALUES (" + req.body.position_name + "); ";
    
    connection.query(q, function(err, results){
        if(err)
            throw err;
            
        res.redirect("editTables");
    });
});

app.post("/removeFromTable", function(req, res){
    var table_name = req.body.listName;
    var row_id = req.body.remove_row;

    console.log(table_name);
    console.log(row_id);

    var q = [];
    if(table_name==="Group Information")
        q = "DELETE FROM GroupInformation_Table WHERE ID=" + row_id + "; ";
    else if(table_name==="Facility")
        q = "DELETE FROM Facility_Table WHERE ID=" + row_id + "; ";
    else if(table_name==="Subframe Type")
        q = "DELETE FROM SubframeType_Table WHERE ID=" + row_id + "; ";    
    else if(table_name==="Device List")
        q = "DELETE FROM DeviceList_Table WHERE ID=" + row_id + "; ";
    else if(table_name==="ROI Type")
        q = "DELETE FROM GroupInformation_Table WHERE ID=" + row_id + "; ";
    else if(table_name==="Detection Method")
        q = "DELETE FROM DetectionMethod_Table WHERE ID=" + row_id + "; ";
    else if(table_name==="Event Type")
        q = "DELETE FROM EventType_Table WHERE ID=" + row_id + "; ";
    else if(table_name==="Fiducial Position")
        q = "DELETE FROM FiducialPosition_Table WHERE ID=" + row_id + "; ";
     
    connection.query(q, function(err, results){
        if(err)
            throw err;
        
        res.redirect("editTables");
    });
});


app.post("/viewDBTables", function(req, res){ 
    res.render("view_db_tables");      
});

app.post("/submitSubframeInfoManually", function(req, res){
    
    variables.subframe_data_itemNamesData.subframe_validity = (req.body.subframe_validity ? true:false);
    var subframe_id = req.body.subframe_id;
    if(variables.subframe_data_itemNamesData.subframe_validity){
        variables.subframe_data_itemNamesData.facility_name = subframe_id.substr(0, 5);
        variables.subframe_data_itemNamesData.subframe_type = subframe_id.substr(5, 3);
        variables.subframe_data_itemNamesData.serial_number = Number(subframe_id.substr(8,));
        variables.subframe_data_itemNamesData.group_name = req.body.group_name;
        variables.subframe_data_itemNamesData.subframe_experiment_date = req.body.subframe_experiment_date;
        variables.subframe_data_itemNamesData.subframe_experiment_time = req.body.subframe_experiment_time;
        variables.subframe_data_itemNamesData.subframe_comments = req.body.subframe_comments;
        variables.subframe_data_itemNamesData.subframe_device_select = req.body.subframe_device_select;
        variables.subframe_data_itemNamesData.subframe_event_select = req.body.subframe_event_select;
        variables.subframe_data_itemNamesData.subframe_link_to_data = req.body.subframe_link_to_data;
        variables.subframe_data_itemNamesData.subframe_link_to_meta_data = req.body.subframe_link_to_meta_data;
        variables.subframe_data_itemNamesData.subframe_event_experiment_date = req.body.subframe_event_experiment_date;
        variables.subframe_data_itemNamesData.subframe_event_experiment_time = req.body.subframe_event_experiment_time;
        variables.subframe_data_itemNamesData.subframe_events_comments = req.body.subframe_events_comments;
    } else {
        variables.subframe_data_itemNamesData.subframe_invalid_date = req.body.subframe_invalid_date;
        variables.subframe_data_itemNamesData.subframe_invalid_time = req.body.subframe_invalid_time;
        variables.subframe_data_itemNamesData.facility_name = subframe_id.substr(0, 5);
        variables.subframe_data_itemNamesData.subframe_type = subframe_id.substr(5, 3);
        variables.subframe_data_itemNamesData.serial_number = Number(subframe_id.substr(8,));
    }

    if (functions.checkEmpty(variables.subframe_data_itemNamesData, "subframe_data")) {
            res.render("home_manually_subframe");
    } else { 
        res.render("manually_roi_fiducials");
    }    
});

app.post("/submitROIFiducialsManually", function(req, res){
    variables.roi_fiducials_itemNamesData.roi_event_fid1_validity = (req.body.roi_event_fid1_validity ? true:false);
    variables.roi_fiducials_itemNamesData.roi_event_fid1_position_name = req.body.roi_event_fid1_position_name;
    variables.roi_fiducials_itemNamesData.roi_event_fid1_x_position = req.body.roi_event_fid1_x_position;
    variables.roi_fiducials_itemNamesData.roi_event_fid1_y_position = req.body.roi_event_fid1_y_position;
    variables.roi_fiducials_itemNamesData.roi_event_fid1_z_position = req.body.roi_event_fid1_z_position;
    variables.roi_fiducials_itemNamesData.roi_event_fid1_experiment_date = req.body.roi_event_fid1_experiment_date;
    variables.roi_fiducials_itemNamesData.roi_event_fid1_experiment_time = req.body.roi_event_fid1_experiment_time;
    variables.roi_fiducials_itemNamesData.roi_event_fid2_validity = (req.body.roi_event_fid2_validity ? true:false);
    variables.roi_fiducials_itemNamesData.roi_event_fid2_position_name = req.body.roi_event_fid2_position_name;
    variables.roi_fiducials_itemNamesData.roi_event_fid2_x_position = req.body.roi_event_fid2_x_position;
    variables.roi_fiducials_itemNamesData.roi_event_fid2_y_position = req.body.roi_event_fid2_y_position;
    variables.roi_fiducials_itemNamesData.roi_event_fid2_z_position = req.body.roi_event_fid2_z_position;
    variables.roi_fiducials_itemNamesData.roi_event_fid2_experiment_date = req.body.roi_event_fid2_experiment_date;
    variables.roi_fiducials_itemNamesData.roi_event_fid2_experiment_time = req.body.roi_event_fid2_experiment_time;
    variables.roi_fiducials_itemNamesData.roi_event_fid3_validity = (req.body.roi_event_fid3_validity ? true:false);
    variables.roi_fiducials_itemNamesData.roi_event_fid3_position_name = req.body.roi_event_fid3_position_name;
    variables.roi_fiducials_itemNamesData.roi_event_fid3_x_position = req.body.roi_event_fid3_x_position;
    variables.roi_fiducials_itemNamesData.roi_event_fid3_y_position = req.body.roi_event_fid3_y_position;
    variables.roi_fiducials_itemNamesData.roi_event_fid3_z_position = req.body.roi_event_fid3_z_position;
    variables.roi_fiducials_itemNamesData.roi_event_fid3_experiment_date = req.body.roi_event_fid3_experiment_date;
    variables.roi_fiducials_itemNamesData.roi_event_fid3_experiment_time = req.body.roi_event_fid3_experiment_time;

    if (functions.checkEmpty(variables.roi_fiducials_itemNamesData, "roi_fids")) {
            res.render("manually_roi_fiducials");
    } else { 
        res.render("manually_roi_image");
    }  
});

app.post("/submitROIImageManually", function(req, res){
    variables.roi_data_itemNamesData.roi_type = req.body.roi_type;
    variables.roi_data_itemNamesData.roi_detection_method = req.body.roi_detection_method;
    variables.roi_data_itemNamesData.roi_experiment_x_position = req.body.roi_experiment_x_position;
    variables.roi_data_itemNamesData.roi_experiment_y_position = req.body.roi_experiment_y_position;
    variables.roi_data_itemNamesData.roi_experiment_width = req.body.roi_experiment_width;
    variables.roi_data_itemNamesData.roi_experiment_height = req.body.roi_experiment_height;
    variables.roi_data_itemNamesData.roi_mask_load = req.body.roi_mask_load;
    variables.roi_data_itemNamesData.roi_experiment_date = req.body.roi_experiment_date;
    variables.roi_data_itemNamesData.roi_experiment_time = req.body.roi_experiment_time;
    variables.roi_data_itemNamesData.roi_experiment_comments = req.body.roi_experiment_comments;
    variables.roi_data_itemNamesData.roi_device = req.body.roi_device;
    variables.roi_data_itemNamesData.roi_event_type = req.body.roi_event_type;
    variables.roi_data_itemNamesData.roi_event_link_to_data = req.body.roi_event_link_to_data;
    variables.roi_data_itemNamesData.roi_event_link_to_meta_data = req.body.roi_event_link_to_meta_data;
    variables.roi_data_itemNamesData.roi_event_date = req.body.roi_event_date;
    variables.roi_data_itemNamesData.roi_event_time = req.body.roi_event_time;
    variables.roi_data_itemNamesData.roi_event_comments = req.body.roi_event_comments;
    
    if (functions.checkEmpty(variables.roi_data_itemNamesData, "roi_data")) {
        res.render("manually_roi_image");
    } else { 
        res.render("manually_sample_fiducials");
    }
});

app.post("/submitSampleFiducialsManually", function(req, res){
    variables.sample_fiducials_itemNamesData.sample_event_fid1_validity = (req.body.sample_event_fid1_validity ? true:false);
    variables.sample_fiducials_itemNamesData.sample_event_fid1_position_name = req.body.sample_event_fid1_position_name;
    variables.sample_fiducials_itemNamesData.sample_event_fid1_x_position = req.body.sample_event_fid1_x_position;
    variables.sample_fiducials_itemNamesData.sample_event_fid1_y_position = req.body.sample_event_fid1_y_position;
    variables.sample_fiducials_itemNamesData.sample_event_fid1_z_position = req.body.sample_event_fid1_z_position;
    variables.sample_fiducials_itemNamesData.sample_event_fid1_experiment_date = req.body.sample_event_fid1_experiment_date;
    variables.sample_fiducials_itemNamesData.sample_event_fid1_experiment_time = req.body.sample_event_fid1_experiment_time;
    variables.sample_fiducials_itemNamesData.sample_event_fid2_validity = (req.body.sample_event_fid2_validity ? true:false);
    variables.sample_fiducials_itemNamesData.sample_event_fid2_position_name = req.body.sample_event_fid2_position_name;
    variables.sample_fiducials_itemNamesData.sample_event_fid2_x_position = req.body.sample_event_fid2_x_position;
    variables.sample_fiducials_itemNamesData.sample_event_fid2_y_position = req.body.sample_event_fid2_y_position;
    variables.sample_fiducials_itemNamesData.sample_event_fid2_z_position = req.body.sample_event_fid2_z_position;
    variables.sample_fiducials_itemNamesData.sample_event_fid2_experiment_date = req.body.sample_event_fid2_experiment_date;
    variables.sample_fiducials_itemNamesData.sample_event_fid1_experiment_time = req.body.sample_event_fid1_experiment_time;
    variables.sample_fiducials_itemNamesData.sample_event_fid3_validity = (req.body.sample_event_fid3_validity ? true:false);
    variables.sample_fiducials_itemNamesData.sample_event_fid3_position_name = req.body.sample_event_fid3_position_name
    variables.sample_fiducials_itemNamesData.sample_event_fid3_x_position = req.body.sample_event_fid3_x_position;
    variables.sample_fiducials_itemNamesData.sample_event_fid3_y_position = req.body.sample_event_fid3_y_position;
    variables.sample_fiducials_itemNamesData.sample_event_fid3_z_position = req.body.sample_event_fid3_z_position;
    variables.sample_fiducials_itemNamesData.sample_event_fid3_experiment_date = req.body.sample_event_fid3_experiment_date;
    variables.sample_fiducials_itemNamesData.sample_event_fid3_experiment_time = req.body.sample_event_fid3_experiment_time;

    if (functions.checkEmpty(variables.sample_fiducials_itemNamesData, "sampleimage_fids")) {
        res.render("manually_sample_fiducials");
    } else {
        res.render("manually_sample_image");
    }
});

app.post("/submitSampleImageManually", function(req, res){
    variables.sample_data_itemNamesData.sample_experiment_x_position = req.body.sample_experiment_x_position;
    variables.sample_data_itemNamesData.sample_experiment_y_position = req.body.sample_experiment_y_position;
    variables.sample_data_itemNamesData.sample_experiment_width = req.body.sample_experiment_width;
    variables.sample_data_itemNamesData.sample_experiment_height = req.body.sample_experiment_height;
    variables.sample_data_itemNamesData.sample_experiment_theta = req.body.sample_experiment_theta;
    variables.sample_data_itemNamesData.sample_experiment_phi = req.body.sample_experiment_phi;
    variables.sample_data_itemNamesData.sample_experiment_rho = req.body.sample_experiment_rho;
    variables.sample_data_itemNamesData.sample_detection_method = req.body.sample_detection_method;
    variables.sample_data_itemNamesData.sample_mask_load = req.body.sample_mask_load;
    variables.sample_data_itemNamesData.sample_experiment_date = req.body.sample_experiment_date;
    variables.sample_data_itemNamesData.sample_experiment_time = req.body.sample_experiment_time;
    variables.sample_data_itemNamesData.sample_experiment_comments = req.body.sample_experiment_comments;
    variables.sample_data_itemNamesData.sample_device = req.body.sample_device;
    variables.sample_data_itemNamesData.sample_event_type = req.body.sample_event_type;
    variables.sample_data_itemNamesData.sample_event_link_to_data = req.body.sample_event_link_to_data;
    variables.sample_data_itemNamesData.sample_event_link_to_meta_data = req.body.sample_event_link_to_meta_data;
    variables.sample_data_itemNamesData.sample_event_date = req.body.sample_event_date;
    variables.sample_data_itemNamesData.sample_event_time = req.body.sample_event_time;
    variables.sample_data_itemNamesData.sample_event_comments = req.body.sample_event_comments;
    
    if (functions.checkEmpty(variables.sample_data_itemNamesData, "sampleimage_data")) {
            res.render("manually_sample_image");
    } else {
        res.render("manually_target_fiducials");
    }
});

app.post("/submitTargetFiducialsManually", function(req, res){
    variables.target_fiducials_itemNamesData.target_event_fid1_validity = (req.body.target_event_fid1_validity ? true:false);
    variables.target_fiducials_itemNamesData.target_event_fid1_position_name = req.body.target_event_fid1_position_name;
    variables.target_fiducials_itemNamesData.target_event_fid1_x_position = req.body.target_event_fid1_x_position;
    variables.target_fiducials_itemNamesData.target_event_fid1_y_position = req.body.target_event_fid1_y_position;
    variables.target_fiducials_itemNamesData.target_event_fid1_z_position = req.body.target_event_fid1_z_position;
    variables.target_fiducials_itemNamesData.target_event_fid1_experiment_date = req.body.target_event_fid1_experiment_date;
    variables.target_fiducials_itemNamesData.target_event_fid1_experiment_time = req.body.target_event_fid1_experiment_time;
    variables.target_fiducials_itemNamesData.target_event_fid2_validity = (req.body.target_event_fid2_validity ? true:false);
    variables.target_fiducials_itemNamesData.target_event_fid2_position_name = req.body.target_event_fid2_position_name;
    variables.target_fiducials_itemNamesData.target_event_fid2_x_position = req.body.target_event_fid2_x_position;
    variables.target_fiducials_itemNamesData.target_event_fid2_y_position = req.body.target_event_fid2_y_position;
    variables.target_fiducials_itemNamesData.target_event_fid2_z_position = req.body.target_event_fid2_z_position;
    variables.target_fiducials_itemNamesData.target_event_fid2_experiment_date = req.body.target_event_fid2_experiment_date;
    variables.target_fiducials_itemNamesData.target_event_fid1_experiment_time = req.body.target_event_fid1_experiment_time;
    variables.target_fiducials_itemNamesData.target_event_fid3_validity = (req.body.target_event_fid3_validity ? true:false);
    variables.target_fiducials_itemNamesData.target_event_fid3_position_name = req.body.target_event_fid3_position_name;
    variables.target_fiducials_itemNamesData.target_event_fid3_x_position = req.body.target_event_fid3_x_position;
    variables.target_fiducials_itemNamesData.target_event_fid3_y_position = req.body.target_event_fid3_y_position;
    variables.target_fiducials_itemNamesData.target_event_fid3_z_position = req.body.target_event_fid3_z_position;
    variables.target_fiducials_itemNamesData.target_event_fid3_experiment_date = req.body.target_event_fid3_experiment_date;
    variables.target_fiducials_itemNamesData.target_event_fid3_experiment_time = req.body.target_event_fid3_experiment_time;

    if (functions.checkEmpty(variables.target_fiducials_itemNamesData, "target_fids")) {
        res.render("manually_target_fiducials");
    } else {
        res.render("manually_target_data");
    }    
});

app.post("/submitAllData", function(req, res){
    
    variables.target_data_itemNamesData.target_x_position = req.body.target_x_position;
    variables.target_data_itemNamesData.target_y_position = req.body.target_y_position;
    variables.target_data_itemNamesData.target_z_position = req.body.target_z_position;
    variables.target_data_itemNamesData.targetinfo_experiment_date = req.body.targetinfo_experiment_date;
    variables.target_data_itemNamesData.targetinfo_experiment_time = req.body.targetinfo_experiment_time;
    variables.target_data_itemNamesData.target_comments = req.body.target_comments;
    variables.target_data_itemNamesData.target_device = req.body.target_device;
    variables.target_data_itemNamesData.target_event_type = req.body.target_event_type;
    variables.target_data_itemNamesData.target_link_to_data = req.body.target_link_to_data;
    variables.target_data_itemNamesData.target_link_to_meta_data = req.body.target_link_to_meta_data;
    variables.target_data_itemNamesData.target_event_date = req.body.target_event_date;
    variables.target_data_itemNamesData.target_event_time = req.body.target_event_time;
    variables.target_data_itemNamesData.target_event_comments = req.body.target_event_comments;
    
    if (functions.checkEmpty(variables.target_data_itemNamesData, "target_data")) {
        res.render("manually_target_data");
    } else {

        var db_query = [];
        
        if (!variables.subframe_data_itemNamesData.subframe_validity) {
            db_query = "UPDATE Subframe_Table SET Validity=0, InvalidSinceTimeStamp='" +  variables.subframe_data_itemNamesData.subframe_invalid_date + 
            " " + variables.subframe_data_itemNamesData.subframe_invalid_time + ":00' WHERE SubframeTypeID=(SELECT ID FROM SubframeType_Table WHERE TypeName='" + 
            variables.subframe_data_itemNamesData.subframe_type + "') AND FacilityID=(SELECT ID FROM Facility_Table WHERE CodeName='" +
            variables.subframe_data_itemNamesData.facility_name + "') AND SerialNumber=" + variables.subframe_data_itemNamesData.serial_number + ";";      
            
            connection.query(db_query, function (error, result) {
                if (error) throw error;
                console.log(result);
                res.redirect("/");
            }); 
        } else {
            console.log("inserting the subframe information to the database");
            var subframe_query = "UPDATE Subframe_Table SET Validity=1, GroupID=(SELECT ID FROM GroupInformation_Table WHERE GroupName='" + 
            variables.subframe_data_itemNamesData.group_name + "'), CreateTimeStamp='" + variables.subframe_data_itemNamesData.subframe_experiment_date + " " + 
            variables.subframe_data_itemNamesData.subframe_experiment_time + ":00', Comments='" + variables.subframe_data_itemNamesData.subframe_comments  + "' WHERE " + 
            "SubframeTypeID=(SELECT ID FROM SubframeType_Table WHERE TypeName='" + variables.subframe_data_itemNamesData.subframe_type + 
            "') AND FacilityID=(SELECT ID FROM Facility_Table WHERE CodeName='" + variables.subframe_data_itemNamesData.facility_name + "') AND SerialNumber=" +
            variables.subframe_data_itemNamesData.serial_number + "; ";

            connection.query(subframe_query, function (error, result) {
                if (error) throw error;
                //console.log(result);
            });

            console.log("inserting the subframe related fiducial information to the database");
            var subframe_event_fiducial1 = "INSERT INTO Fiducial_Table (Validity, PositionID, X, Y, Z, CreateTimeStamp) VALUES (" +
            variables.subframe_fiducials_itemNamesData.subframe_fid1_validity + ", (SELECT ID FROM FiducialPosition_Table WHERE PositionName='" + 
            variables.subframe_fiducials_itemNamesData.subframe_fid1_position_name + "'), " + variables.subframe_fiducials_itemNamesData.subframe_fid1_x_position + 
            ", " + variables.subframe_fiducials_itemNamesData.subframe_fid1_y_position + ", " + variables.subframe_fiducials_itemNamesData.subframe_fid1_z_position + 
            ", '" + variables.subframe_fiducials_itemNamesData.subframe_fid1_date + " " + variables.subframe_fiducials_itemNamesData.subframe_fid1_time + ":00'); ";

            var subframe_event_fiducial2 = "INSERT INTO Fiducial_Table (Validity, PositionID, X, Y, Z, CreateTimeStamp) VALUES (" +
            variables.subframe_fiducials_itemNamesData.subframe_fid2_validity + ", (SELECT ID FROM FiducialPosition_Table WHERE PositionName='" + 
            variables.subframe_fiducials_itemNamesData.subframe_fid2_position_name + "'), " + variables.subframe_fiducials_itemNamesData.subframe_fid2_x_position + 
            ", " + variables.subframe_fiducials_itemNamesData.subframe_fid2_y_position + ", " + variables.subframe_fiducials_itemNamesData.subframe_fid2_z_position + 
            ", '" + variables.subframe_fiducials_itemNamesData.subframe_fid2_date + " " + variables.subframe_fiducials_itemNamesData.subframe_fid2_time + ":00'); ";

            var subframe_event_fiducial3 = "INSERT INTO Fiducial_Table (Validity, PositionID, X, Y, Z, CreateTimeStamp) VALUES (" +
            variables.subframe_fiducials_itemNamesData.subframe_fid3_validity + ", (SELECT ID FROM FiducialPosition_Table WHERE PositionName='" + 
            variables.subframe_fiducials_itemNamesData.subframe_fid3_position_name + "'), " + variables.subframe_fiducials_itemNamesData.subframe_fid3_x_position + 
            ", " + variables.subframe_fiducials_itemNamesData.subframe_fid3_y_position + ", " + variables.subframe_fiducials_itemNamesData.subframe_fid3_z_position + 
            ", '" + variables.subframe_fiducials_itemNamesData.subframe_fid3_date + " " + variables.subframe_fiducials_itemNamesData.subframe_fid3_time + ":00'); ";

            var three_fids_correctly_added = false;
            subframe_fiducials_query = subframe_event_fiducial1 + subframe_event_fiducial2 + subframe_event_fiducial3;
            connection.query(subframe_fiducials_query, function (error, result) {
                            if (error) throw error;
                            three_fids_correctly_added = true;
                            //console.log(result);
            });

            if (three_fids_correctly_added) {
                var get_last_3_fids_query = "SELECT ID as ids FROM Fiducial_Table ORDER BY DBInsertTimeStamp DESC LIMIT 3";
                connection.query(get_last_3_fids_query, function (error, result) {
                    if (error) throw error;
                    id1 = result[0].ids;
                    id2 = result[1].ids;
                    id3 = result[2].ids;
    
                    var insert_fid_set_quey = "INSERT INTO FiducialSet_Table (FiducialID1, FiducialID2, FiducialID3) VALUES (" + id1 + ", " + id2 + ", " + id3 + "); ";
                    connection.query(insert_fid_set_quey, function (error, result) {
                        if (error) throw error;
                    });
                });
            }

            console.log("inserting the subframe event information to the database");
            var subframe_event_query = "INSERT INTO SubframeEvent_Table (SubframeID, FiducialSetID, DeviceID, LinkToData, " + 
            "LinkToMetaData, Comments, CreateTimeStamp, EventTypeID) VALUES ((SELECT ID FROM Subframe_Table WHERE SubframeTypeID=" +
            "(SELECT ID FROM SubframeType_Table WHERE TypeName='" + variables.subframe_data_itemNamesData.subframe_type + 
            "') AND FacilityID=(SELECT ID FROM Facility_Table WHERE CodeName='" + variables.subframe_data_itemNamesData.facility_name + 
            "') AND SerialNumber=" + variables.subframe_data_itemNamesData.serial_number + "), (SELECT ID FROM FiducialSet_Table ORDER BY ID DESC LIMIT 1), " + 
            "(SELECT ID FROM DeviceList_Table WHERE VendorName='" +
            variables.subframe_data_itemNamesData.subframe_device_select + "'), '" +
            variables.subframe_data_itemNamesData.subframe_link_to_data + "', '" + variables.subframe_data_itemNamesData.subframe_link_to_meta_data +
            "', '" + variables.subframe_data_itemNamesData.subframe_events_comments + "', '" + variables.subframe_data_itemNamesData.subframe_event_experiment_date +
            " " + variables.subframe_data_itemNamesData.subframe_event_experiment_time + ":00', (SELECT ID FROM EventType_Table WHERE EventType='" +
            variables.subframe_data_itemNamesData.subframe_event_select + "')); ";
            
            connection.query(subframe_event_query, function (error, result) {
                if (error) throw error;
            });

            console.log("inserting the ROI related information to the database");
            var roi_query = "INSERT INTO ROI_Table (SubframeID, ROITypeID, BoundingBoxPositionX, BoundingBoxPositionY, BoundingBoxWidth, BoundingBoxHeight, " +
             "MaskDirectory, Comments, CreateTimeStamp) VALUES (" + "(SELECT ID FROM Subframe_Table WHERE SubframeTypeID=" +
             "(SELECT ID FROM SubframeType_Table WHERE TypeName='" + variables.subframe_data_itemNamesData.subframe_type + 
             "') AND FacilityID=(SELECT ID FROM Facility_Table WHERE CodeName='" + variables.subframe_data_itemNamesData.facility_name + 
             "') AND SerialNumber=" + variables.subframe_data_itemNamesData.serial_number + "), " + "(SELECT ID FROM ROIType_Table WHERE Name='" + variables.roi_data_itemNamesData.roi_type + 
             "'), " + variables.roi_data_itemNamesData.roi_experiment_x_position + ", " + variables.roi_data_itemNamesData.roi_experiment_y_position + ", " +
             variables.roi_data_itemNamesData.roi_experiment_width + ", " + variables.roi_data_itemNamesData.roi_experiment_height + ", '" + 
             variables.roi_data_itemNamesData.roi_mask_load + "' , '" + variables.roi_data_itemNamesData.roi_experiment_comments + "', '" + 
             variables.roi_data_itemNamesData.roi_experiment_date + " " + variables.roi_data_itemNamesData.roi_experiment_time + ":00'" + ");";

            connection.query(roi_query, function (error, result) {
                if (error) throw error;
                //console.log(result);
            });
            
            console.log("inserting the ROI related fiducial information to the database");
            var roi_event_fiducial1 = "INSERT INTO Fiducial_Table (Validity, PositionID, X, Y, Z, CreateTimeStamp) VALUES (" +
            variables.roi_fiducials_itemNamesData.roi_event_fid1_validity + ", (SELECT ID FROM FiducialPosition_Table WHERE PositionName='" + 
            variables.roi_fiducials_itemNamesData.roi_event_fid1_position_name + "'), " + variables.roi_fiducials_itemNamesData.roi_event_fid1_x_position + 
            ", " + variables.roi_fiducials_itemNamesData.roi_event_fid1_y_position + ", " + variables.roi_fiducials_itemNamesData.roi_event_fid1_z_position + 
            ", '" + variables.roi_fiducials_itemNamesData.roi_event_fid1_experiment_date + " " + variables.roi_fiducials_itemNamesData.roi_event_fid1_experiment_time + ":00'); ";

            var roi_event_fiducial2 = "INSERT INTO Fiducial_Table (Validity, PositionID, X, Y, Z, CreateTimeStamp) VALUES (" +
            variables.roi_fiducials_itemNamesData.roi_event_fid2_validity + ", (SELECT ID FROM FiducialPosition_Table WHERE PositionName='" + 
            variables.roi_fiducials_itemNamesData.roi_event_fid2_position_name + "'), " + variables.roi_fiducials_itemNamesData.roi_event_fid2_x_position + 
            ", " + variables.roi_fiducials_itemNamesData.roi_event_fid2_y_position + ", " + variables.roi_fiducials_itemNamesData.roi_event_fid2_z_position + 
            ", '" + variables.roi_fiducials_itemNamesData.roi_event_fid2_experiment_date + " " + variables.roi_fiducials_itemNamesData.roi_event_fid2_experiment_time + ":00'); ";

            var roi_event_fiducial3 = "INSERT INTO Fiducial_Table (Validity, PositionID, X, Y, Z, CreateTimeStamp) VALUES (" +
            variables.roi_fiducials_itemNamesData.roi_event_fid3_validity + ", (SELECT ID FROM FiducialPosition_Table WHERE PositionName='" + 
            variables.roi_fiducials_itemNamesData.roi_event_fid3_position_name + "'), " + variables.roi_fiducials_itemNamesData.roi_event_fid3_x_position + 
            ", " + variables.roi_fiducials_itemNamesData.roi_event_fid3_y_position + ", " + variables.roi_fiducials_itemNamesData.roi_event_fid3_z_position + 
            ", '" + variables.roi_fiducials_itemNamesData.roi_event_fid3_experiment_date + " " + variables.roi_fiducials_itemNamesData.roi_event_fid3_experiment_time + ":00'); ";

            three_fids_correctly_added = false;
            roi_fiducials_query = roi_event_fiducial1 + roi_event_fiducial2 + roi_event_fiducial3;
            connection.query(roi_fiducials_query, function (error, result) {
                            if (error) throw error;
                            three_fids_correctly_added = true;
                            //console.log(result);
            });

            if (three_fids_correctly_added) {
                var get_last_3_fids_query = "SELECT ID as ids FROM Fiducial_Table ORDER BY DBInsertTimeStamp DESC LIMIT 3";
                connection.query(get_last_3_fids_query, function (error, result) {
                    if (error) throw error;
                    id1 = result[0].ids;
                    id2 = result[1].ids;
                    id3 = result[2].ids;
                    var insert_fid_set_quey = "INSERT INTO FiducialSet_Table (FiducialID1, FiducialID2, FiducialID3) VALUES (" + id1 + ", " + id2 + ", " + id3 + "); ";
                    connection.query(insert_fid_set_quey, function (error, result) {
                        if (error) throw error;
                    });
                });
            }

            console.log("inserting the ROI event information to the database");
            console.log("*** we assume that the event corresponds to the ID of the last ROI added ***");
            var roi_event_query = "INSERT INTO ROIEvent_Table (ROIID, EventTypeID, FiducialSetID, DeviceID, " + 
            "LinkToData, LinkToMetaData, Comments, CreateTimeStamp) VALUES ((SELECT ID FROM ROI_Table ORDER BY ID LIMIT 1), (SELECT ID FROM EventType_Table WHERE EventType='" +
            variables.roi_data_itemNamesData.roi_event_type + "'), (SELECT ID FROM FiducialSet_Table ORDER BY ID DESC LIMIT 1), " + "(SELECT ID FROM DeviceList_Table WHERE VendorName='" +
            variables.roi_data_itemNamesData.roi_device + "'), '" + variables.roi_data_itemNamesData.roi_event_link_to_data + "', '" + variables.roi_data_itemNamesData.roi_event_link_to_meta_data +
            "', '" + variables.roi_data_itemNamesData.roi_event_comments + "', '" + variables.roi_data_itemNamesData.roi_event_date +
            " " + variables.roi_data_itemNamesData.roi_event_time + ":00'); ";

            connection.query(roi_event_query, function (error, result) {
                if (error) throw error;
            });
            
            console.log("inserting the sample related information to the database");
            var sample_query = "INSERT INTO Sample_Table (ROIID, BoundingBoxPositionX, BoundingBoxPositionY, BoundingBoxWidth, BoundingBoxHeight, " +
            "Theta, Phi, Rho, MaskDirectory, Comments, CreateTimeStamp) VALUES (" + "(SELECT ID FROM ROI_Table ORDER BY DBInsertTimeStamp DESC LIMIT 1), " +
            + variables.sample_data_itemNamesData.sample_experiment_x_position + ", " + variables.sample_data_itemNamesData.sample_experiment_y_position + ", " +
            variables.sample_data_itemNamesData.sample_experiment_width + ", " + variables.sample_data_itemNamesData.sample_experiment_height + ", " + 
            variables.sample_data_itemNamesData.sample_experiment_theta + ", " + variables.sample_data_itemNamesData.sample_experiment_phi + ", " +
            variables.sample_data_itemNamesData.sample_experiment_rho + ", '" + variables.sample_data_itemNamesData.sample_mask_load + "' , '" + 
            variables.sample_data_itemNamesData.sample_experiment_comments + "', '" + variables.sample_data_itemNamesData.sample_experiment_date + " " + 
            variables.sample_data_itemNamesData.sample_experiment_time + ":00'" + ");";

            connection.query(sample_query, function (error, result) {
                if (error) throw error;
                //console.log(result);
            });

            console.log("inserting the sample related fiducial information to the database");
            var sample_event_fiducial1 = "INSERT INTO Fiducial_Table (Validity, PositionID, X, Y, Z, CreateTimeStamp) VALUES (" +
            variables.sample_fiducials_itemNamesData.sample_event_fid1_validity + ", (SELECT ID FROM FiducialPosition_Table WHERE PositionName='" + 
            variables.sample_fiducials_itemNamesData.sample_event_fid1_position_name + "'), " + variables.sample_fiducials_itemNamesData.sample_event_fid1_x_position + 
            ", " + variables.sample_fiducials_itemNamesData.sample_event_fid1_y_position + ", " + variables.sample_fiducials_itemNamesData.sample_event_fid1_z_position + 
            ", '" + variables.sample_fiducials_itemNamesData.sample_event_fid1_experiment_date + " " + variables.sample_fiducials_itemNamesData.sample_event_fid1_experiment_time + ":00'); ";

            var sample_event_fiducial2 = "INSERT INTO Fiducial_Table (Validity, PositionID, X, Y, Z, CreateTimeStamp) VALUES (" +
            variables.sample_fiducials_itemNamesData.sample_event_fid2_validity + ", (SELECT ID FROM FiducialPosition_Table WHERE PositionName='" + 
            variables.sample_fiducials_itemNamesData.sample_event_fid2_position_name + "'), " + variables.sample_fiducials_itemNamesData.sample_event_fid2_x_position + 
            ", " + variables.sample_fiducials_itemNamesData.sample_event_fid2_y_position + ", " + variables.sample_fiducials_itemNamesData.sample_event_fid2_z_position + 
            ", '" + variables.sample_fiducials_itemNamesData.sample_event_fid2_experiment_date + " " + variables.sample_fiducials_itemNamesData.sample_event_fid2_experiment_time + ":00'); ";

            var sample_event_fiducial3 = "INSERT INTO Fiducial_Table (Validity, PositionID, X, Y, Z, CreateTimeStamp) VALUES (" +
            variables.sample_fiducials_itemNamesData.sample_event_fid3_validity + ", (SELECT ID FROM FiducialPosition_Table WHERE PositionName='" + 
            variables.sample_fiducials_itemNamesData.sample_event_fid3_position_name + "'), " + variables.sample_fiducials_itemNamesData.sample_event_fid3_x_position + 
            ", " + variables.sample_fiducials_itemNamesData.sample_event_fid3_y_position + ", " + variables.sample_fiducials_itemNamesData.sample_event_fid3_z_position + 
            ", '" + variables.sample_fiducials_itemNamesData.sample_event_fid3_experiment_date + " " + variables.sample_fiducials_itemNamesData.sample_event_fid3_experiment_time + ":00'); ";

            three_fids_correctly_added = false;
            sample_fiducials_query = sample_event_fiducial1 + sample_event_fiducial2 + sample_event_fiducial3;
            connection.query(sample_fiducials_query, function (error, result) {
                            if (error) throw error;
                            three_fids_correctly_added = true;
                            //console.log(result);
            });

            if (three_fids_correctly_added) {
                var get_last_3_fids_query = "SELECT ID as ids FROM Fiducial_Table ORDER BY DBInsertTimeStamp DESC LIMIT 3";
                connection.query(get_last_3_fids_query, function (error, result) {
                    if (error) throw error;
                    id1 = result[0].ids;
                    id2 = result[1].ids;
                    id3 = result[2].ids;
                
                    var insert_fid_set_quey = "INSERT INTO FiducialSet_Table (FiducialID1, FiducialID2, FiducialID3) VALUES (" + id1 + ", " + id2 + ", " + id3 + "); ";
                    connection.query(insert_fid_set_quey, function (error, result) {
                        if (error) throw error;
                    });
                });
            }

            console.log("inserting the sample event information to the database");
            console.log("*** we assume that the event corresponds to the ID of the last Sample added ***");
            var sample_event_query = "INSERT INTO SampleEvent_Table (SampleID, EventTypeID, FiducialSetID, DeviceID, " + 
            "LinkToData, LinkToMetaData, Comments, CreateTimeStamp) VALUES ((SELECT ID FROM Sample_Table ORDER BY ID LIMIT 1), (SELECT ID FROM EventType_Table WHERE EventType='" +
            variables.sample_data_itemNamesData.sample_event_type + "'), (SELECT ID FROM FiducialSet_Table ORDER BY ID DESC LIMIT 1), " + "(SELECT ID FROM DeviceList_Table WHERE VendorName='" +
            variables.sample_data_itemNamesData.sample_device + "'), '" + variables.sample_data_itemNamesData.sample_event_link_to_data + "', '" + variables.sample_data_itemNamesData.sample_event_link_to_meta_data +
            "', '" + variables.sample_data_itemNamesData.sample_event_comments + "', '" + variables.sample_data_itemNamesData.sample_event_date +
            " " + variables.sample_data_itemNamesData.sample_event_time + ":00'); ";

            connection.query(sample_event_query, function (error, result) {
                if (error) throw error;
            });

            console.log("inserting the target related information to the database");
            var target_query = "INSERT INTO Target_Table (SampleID, X, Y, Z, Comments, CreateTimeStamp) VALUES (" + 
            "(SELECT ID FROM Sample_Table ORDER BY DBInsertTimeStamp DESC LIMIT 1), " +
            + variables.target_data_itemNamesData.target_x_position + ", " + variables.target_data_itemNamesData.target_y_position + ", " +
            variables.target_data_itemNamesData.target_z_position + ", '" + variables.target_data_itemNamesData.target_comments + "', '" + 
            variables.target_data_itemNamesData.targetinfo_experiment_date + " " + variables.target_data_itemNamesData.targetinfo_experiment_time + ":00'" + ");";

            connection.query(target_query, function (error, result) {
                if (error) throw error;
                //console.log(result);
            });

            console.log("inserting the target related fiducial information to the database");
            var target_event_fiducial1 = "INSERT INTO Fiducial_Table (Validity, PositionID, X, Y, Z, CreateTimeStamp) VALUES (" +
            variables.target_fiducials_itemNamesData.target_event_fid1_validity + ", (SELECT ID FROM FiducialPosition_Table WHERE PositionName='" + 
            variables.target_fiducials_itemNamesData.target_event_fid1_position_name + "'), " + variables.target_fiducials_itemNamesData.target_event_fid1_x_position + 
            ", " + variables.target_fiducials_itemNamesData.target_event_fid1_y_position + ", " + variables.target_fiducials_itemNamesData.target_event_fid1_z_position + 
            ", '" + variables.target_fiducials_itemNamesData.target_event_fid1_experiment_date + " " + variables.target_fiducials_itemNamesData.target_event_fid1_experiment_time + ":00'); ";

            var target_event_fiducial2 = "INSERT INTO Fiducial_Table (Validity, PositionID, X, Y, Z, CreateTimeStamp) VALUES (" +
            variables.target_fiducials_itemNamesData.target_event_fid2_validity + ", (SELECT ID FROM FiducialPosition_Table WHERE PositionName='" + 
            variables.target_fiducials_itemNamesData.target_event_fid2_position_name + "'), " + variables.target_fiducials_itemNamesData.target_event_fid2_x_position + 
            ", " + variables.target_fiducials_itemNamesData.target_event_fid2_y_position + ", " + variables.target_fiducials_itemNamesData.target_event_fid2_z_position + 
            ", '" + variables.target_fiducials_itemNamesData.target_event_fid2_experiment_date + " " + variables.target_fiducials_itemNamesData.target_event_fid2_experiment_time + ":00'); ";

            var target_event_fiducial3 = "INSERT INTO Fiducial_Table (Validity, PositionID, X, Y, Z, CreateTimeStamp) VALUES (" +
            variables.target_fiducials_itemNamesData.target_event_fid3_validity + ", (SELECT ID FROM FiducialPosition_Table WHERE PositionName='" + 
            variables.target_fiducials_itemNamesData.target_event_fid3_position_name + "'), " + variables.target_fiducials_itemNamesData.target_event_fid3_x_position + 
            ", " + variables.target_fiducials_itemNamesData.target_event_fid3_y_position + ", " + variables.target_fiducials_itemNamesData.target_event_fid3_z_position + 
            ", '" + variables.target_fiducials_itemNamesData.target_event_fid3_experiment_date + " " + variables.target_fiducials_itemNamesData.target_event_fid3_experiment_time + ":00'); ";

            three_fids_correctly_added = false;
            target_fiducials_query = target_event_fiducial1 + target_event_fiducial2 + target_event_fiducial3;
            connection.query(target_fiducials_query, function (error, result) {
                            if (error) throw error;
                            three_fids_correctly_added = true;
                            //console.log(result);
            });

            if (three_fids_correctly_added) {
                var get_last_3_fids_query = "SELECT ID as ids FROM Fiducial_Table ORDER BY DBInsertTimeStamp DESC LIMIT 3";
                connection.query(get_last_3_fids_query, function (error, result) {
                    if (error) throw error;
                    id1 = result[0].ids;
                    id2 = result[1].ids;
                    id3 = result[2].ids;
                    var insert_fid_set_quey = "INSERT INTO FiducialSet_Table (FiducialID1, FiducialID2, FiducialID3) VALUES (" + id1 + ", " + id2 + ", " + id3 + "); ";
                    connection.query(insert_fid_set_quey, function (error, result) {
                        if (error) throw error;
                    });
                });
            }

            console.log("inserting the target event information to the database");
            console.log("*** we assume that the event corresponds to the ID of the last target added ***");
            var target_event_query = "INSERT INTO TargetEvent_Table (TargetID, EventTypeID, FiducialSetID, DeviceID, " + 
            "LinkToData, LinkToMetaData, Comments, CreateTimeStamp) VALUES ((SELECT ID FROM Target_Table ORDER BY ID LIMIT 1), (SELECT ID FROM EventType_Table WHERE EventType='" +
            variables.target_data_itemNamesData.target_event_type + "'), (SELECT ID FROM FiducialSet_Table ORDER BY ID DESC LIMIT 1), " + "(SELECT ID FROM DeviceList_Table WHERE VendorName='" +
            variables.target_data_itemNamesData.target_device + "'), '" + variables.target_data_itemNamesData.target_link_to_data + "', '" + 
            variables.target_data_itemNamesData.target_link_to_meta_data + "', '" + variables.target_data_itemNamesData.target_event_comments + 
            "', '" + variables.target_data_itemNamesData.target_event_date + " " + variables.target_data_itemNamesData.target_event_time + ":00'); ";
            
            console.log(target_event_query);

            connection.query(target_event_query, function (error, result) {
                if (error) throw error;
                console.log("Finished");            
                res.redirect("/");
            });
        }
    }
});

app.post("/submitXMLData", function(req, res){
    
    variables.subframe_fiducials_itemNamesData.subframe_fid1_validity = (req.body.subframe_fid1_validity ? true:false);
    variables.subframe_fiducials_itemNamesData.subframe_fid1_position_name = req.body.subframe_fid1_position_name;
    variables.subframe_fiducials_itemNamesData.subframe_fid1_x_position = req.body.subframe_fid1_x_position;
    variables.subframe_fiducials_itemNamesData.subframe_fid1_y_position = req.body.subframe_fid1_y_position;
    variables.subframe_fiducials_itemNamesData.subframe_fid1_z_position = req.body.subframe_fid1_z_position;
    variables.subframe_fiducials_itemNamesData.subframe_fid1_date = req.body.subframe_fid1_date;
    variables.subframe_fiducials_itemNamesData.subframe_fid1_time = req.body.subframe_fid1_time;
    variables.subframe_fiducials_itemNamesData.subframe_fid2_validity = (req.body.subframe_fid2_validity ? true:false);
    variables.subframe_fiducials_itemNamesData.subframe_fid2_position_name = req.body.subframe_fid2_position_name;
    variables.subframe_fiducials_itemNamesData.subframe_fid2_x_position = req.body.subframe_fid2_x_position;
    variables.subframe_fiducials_itemNamesData.subframe_fid2_y_position = req.body.subframe_fid2_y_position;
    variables.subframe_fiducials_itemNamesData.subframe_fid2_z_position = req.body.subframe_fid2_z_position;
    variables.subframe_fiducials_itemNamesData.subframe_fid2_date = req.body.subframe_fid2_date;
    variables.subframe_fiducials_itemNamesData.subframe_fid2_time = req.body.subframe_fid2_time;
    variables.subframe_fiducials_itemNamesData.subframe_fid3_validity = (req.body.subframe_fid3_validity ? true:false);
    variables.subframe_fiducials_itemNamesData.subframe_fid3_position_name = req.body.subframe_fid3_position_name;
    variables.subframe_fiducials_itemNamesData.subframe_fid3_x_position = req.body.subframe_fid3_x_position;
    variables.subframe_fiducials_itemNamesData.subframe_fid3_y_position = req.body.subframe_fid3_y_position;
    variables.subframe_fiducials_itemNamesData.subframe_fid3_z_position = req.body.subframe_fid3_z_position;
    variables.subframe_fiducials_itemNamesData.subframe_fid3_date = req.body.subframe_fid3_date;
    variables.subframe_fiducials_itemNamesData.subframe_fid3_time = req.body.subframe_fid3_time;
    variables.subframe_data_itemNamesData.facility_name = req.body.subframe_id.substr(0, 5);
    variables.subframe_data_itemNamesData.subframe_type = req.body.subframe_id.substr(5, 3);
    variables.subframe_data_itemNamesData.serial_number = Number(req.body.subframe_id.substr(8,));
    variables.subframe_data_itemNamesData.subframe_validity = (req.body.subframe_validity ? true:false);
    variables.subframe_data_itemNamesData.group_name = req.body.group_name;
    variables.subframe_data_itemNamesData.subframe_experiment_date = req.body.subframe_experiment_date;
    variables.subframe_data_itemNamesData.subframe_experiment_time = req.body.subframe_experiment_time;
    variables.subframe_data_itemNamesData.subframe_comments = req.body.subframe_comments;
    variables.subframe_data_itemNamesData.subframe_device_select = req.body.subframe_device_select;
    variables.subframe_data_itemNamesData.subframe_event_select = req.body.subframe_event_select;
    variables.subframe_data_itemNamesData.subframe_link_to_data = req.body.subframe_link_to_data;
    variables.subframe_data_itemNamesData.subframe_link_to_meta_data = req.body.subframe_link_to_meta_data;
    variables.subframe_data_itemNamesData.subframe_event_experiment_date = req.body.subframe_event_experiment_date;
    variables.subframe_data_itemNamesData.subframe_event_experiment_time = req.body.subframe_event_experiment_time;
    variables.subframe_data_itemNamesData.subframe_events_comments = req.body.subframe_events_comments;
    variables.roi_fiducials_itemNamesData.roi_event_fid1_validity = (req.body.roi_event_fid1_validity ? true:false);
    variables.roi_fiducials_itemNamesData.roi_event_fid1_position_name = req.body.roi_event_fid1_position_name;
    variables.roi_fiducials_itemNamesData.roi_event_fid1_x_position = req.body.roi_event_fid1_x_position;
    variables.roi_fiducials_itemNamesData.roi_event_fid1_y_position = req.body.roi_event_fid1_y_position;
    variables.roi_fiducials_itemNamesData.roi_event_fid1_z_position = req.body.roi_event_fid1_z_position;
    variables.roi_fiducials_itemNamesData.roi_event_fid1_experiment_date = req.body.roi_event_fid1_experiment_date;
    variables.roi_fiducials_itemNamesData.roi_event_fid1_experiment_time = req.body.roi_event_fid1_experiment_time;
    variables.roi_fiducials_itemNamesData.roi_event_fid2_validity = (req.body.roi_event_fid2_validity ? true:false);
    variables.roi_fiducials_itemNamesData.roi_event_fid2_position_name = req.body.roi_event_fid2_position_name;
    variables.roi_fiducials_itemNamesData.roi_event_fid2_x_position = req.body.roi_event_fid2_x_position;
    variables.roi_fiducials_itemNamesData.roi_event_fid2_y_position = req.body.roi_event_fid2_y_position;
    variables.roi_fiducials_itemNamesData.roi_event_fid2_z_position = req.body.roi_event_fid2_z_position;
    variables.roi_fiducials_itemNamesData.roi_event_fid2_experiment_date = req.body.roi_event_fid2_experiment_date;
    variables.roi_fiducials_itemNamesData.roi_event_fid2_experiment_time = req.body.roi_event_fid2_experiment_time;
    variables.roi_fiducials_itemNamesData.roi_event_fid3_validity = (req.body.roi_event_fid3_validity ? true:false);
    variables.roi_fiducials_itemNamesData.roi_event_fid3_position_name = req.body.roi_event_fid3_position_name;
    variables.roi_fiducials_itemNamesData.roi_event_fid3_x_position = req.body.roi_event_fid3_x_position;
    variables.roi_fiducials_itemNamesData.roi_event_fid3_y_position = req.body.roi_event_fid3_y_position;
    variables.roi_fiducials_itemNamesData.roi_event_fid3_z_position = req.body.roi_event_fid3_z_position;
    variables.roi_fiducials_itemNamesData.roi_event_fid3_experiment_date = req.body.roi_event_fid3_experiment_date;
    variables.roi_fiducials_itemNamesData.roi_event_fid3_experiment_time = req.body.roi_event_fid3_experiment_time;
    variables.roi_data_itemNamesData.roi_type = req.body.roi_type;
    variables.roi_data_itemNamesData.roi_detection_method = req.body.roi_detection_method;
    variables.roi_data_itemNamesData.roi_experiment_x_position = req.body.roi_experiment_x_position;
    variables.roi_data_itemNamesData.roi_experiment_y_position = req.body.roi_experiment_y_position;
    variables.roi_data_itemNamesData.roi_experiment_width = req.body.roi_experiment_width;
    variables.roi_data_itemNamesData.roi_experiment_height = req.body.roi_experiment_height;
    variables.roi_data_itemNamesData.roi_mask_load = req.body.roi_mask_load;
    variables.roi_data_itemNamesData.roi_experiment_date = req.body.roi_experiment_date;
    variables.roi_data_itemNamesData.roi_experiment_time = req.body.roi_experiment_time;
    variables.roi_data_itemNamesData.roi_experiment_comments = req.body.roi_experiment_comments;
    variables.roi_data_itemNamesData.roi_device = req.body.roi_device;
    variables.roi_data_itemNamesData.roi_event_type = req.body.roi_event_type;
    variables.roi_data_itemNamesData.roi_event_link_to_data = req.body.roi_event_link_to_data;
    variables.roi_data_itemNamesData.roi_event_link_to_meta_data = req.body.roi_event_link_to_meta_data;
    variables.roi_data_itemNamesData.roi_event_date = req.body.roi_event_date;
    variables.roi_data_itemNamesData.roi_event_time = req.body.roi_event_time;
    variables.roi_data_itemNamesData.roi_event_comments = req.body.roi_event_comments;
    variables.sample_fiducials_itemNamesData.sample_event_fid1_validity = (req.body.sample_event_fid1_validity ? true:false);
    variables.sample_fiducials_itemNamesData.sample_event_fid1_position_name = req.body.sample_event_fid1_position_name;
    variables.sample_fiducials_itemNamesData.sample_event_fid1_x_position = req.body.sample_event_fid1_x_position;
    variables.sample_fiducials_itemNamesData.sample_event_fid1_y_position = req.body.sample_event_fid1_y_position;
    variables.sample_fiducials_itemNamesData.sample_event_fid1_z_position = req.body.sample_event_fid1_z_position;
    variables.sample_fiducials_itemNamesData.sample_event_fid1_experiment_date = req.body.sample_event_fid1_experiment_date;
    variables.sample_fiducials_itemNamesData.sample_event_fid1_experiment_time = req.body.sample_event_fid1_experiment_time;
    variables.sample_fiducials_itemNamesData.sample_event_fid2_validity = (req.body.sample_event_fid2_validity ? true:false);
    variables.sample_fiducials_itemNamesData.sample_event_fid2_position_name = req.body.sample_event_fid2_position_name;
    variables.sample_fiducials_itemNamesData.sample_event_fid2_x_position = req.body.sample_event_fid2_x_position;
    variables.sample_fiducials_itemNamesData.sample_event_fid2_y_position = req.body.sample_event_fid2_y_position;
    variables.sample_fiducials_itemNamesData.sample_event_fid2_z_position = req.body.sample_event_fid2_z_position;
    variables.sample_fiducials_itemNamesData.sample_event_fid2_experiment_date = req.body.sample_event_fid2_experiment_date;
    variables.sample_fiducials_itemNamesData.sample_event_fid1_experiment_time = req.body.sample_event_fid1_experiment_time;
    variables.sample_fiducials_itemNamesData.sample_event_fid3_validity = (req.body.sample_event_fid3_validity ? true:false);
    variables.sample_fiducials_itemNamesData.sample_event_fid3_position_name = req.body.sample_event_fid3_position_name
    variables.sample_fiducials_itemNamesData.sample_event_fid3_x_position = req.body.sample_event_fid3_x_position;
    variables.sample_fiducials_itemNamesData.sample_event_fid3_y_position = req.body.sample_event_fid3_y_position;
    variables.sample_fiducials_itemNamesData.sample_event_fid3_z_position = req.body.sample_event_fid3_z_position;
    variables.sample_fiducials_itemNamesData.sample_event_fid3_experiment_date = req.body.sample_event_fid3_experiment_date;
    variables.sample_fiducials_itemNamesData.sample_event_fid3_experiment_time = req.body.sample_event_fid3_experiment_time;
    variables.sample_data_itemNamesData.sample_experiment_x_position = req.body.sample_experiment_x_position;
    variables.sample_data_itemNamesData.sample_experiment_y_position = req.body.sample_experiment_y_position;
    variables.sample_data_itemNamesData.sample_experiment_width = req.body.sample_experiment_width;
    variables.sample_data_itemNamesData.sample_experiment_height = req.body.sample_experiment_height;
    variables.sample_data_itemNamesData.sample_experiment_theta = req.body.sample_experiment_theta;
    variables.sample_data_itemNamesData.sample_experiment_phi = req.body.sample_experiment_phi;
    variables.sample_data_itemNamesData.sample_experiment_rho = req.body.sample_experiment_rho;
    variables.sample_data_itemNamesData.sample_detection_method = req.body.sample_detection_method;
    variables.sample_data_itemNamesData.sample_mask_load = req.body.sample_mask_load;
    variables.sample_data_itemNamesData.sample_experiment_date = req.body.sample_experiment_date;
    variables.sample_data_itemNamesData.sample_experiment_time = req.body.sample_experiment_time;
    variables.sample_data_itemNamesData.sample_experiment_comments = req.body.sample_experiment_comments;
    variables.sample_data_itemNamesData.sample_device = req.body.sample_device;
    variables.sample_data_itemNamesData.sample_event_type = req.body.sample_event_type;
    variables.sample_data_itemNamesData.sample_event_link_to_data = req.body.sample_event_link_to_data;
    variables.sample_data_itemNamesData.sample_event_link_to_meta_data = req.body.sample_event_link_to_meta_data;
    variables.sample_data_itemNamesData.sample_event_date = req.body.sample_event_date;
    variables.sample_data_itemNamesData.sample_event_time = req.body.sample_event_time;
    variables.sample_data_itemNamesData.sample_event_comments = req.body.sample_event_comments;
    variables.target_fiducials_itemNamesData.target_event_fid1_validity = (req.body.target_event_fid1_validity ? true:false);
    variables.target_fiducials_itemNamesData.target_event_fid1_position_name = req.body.target_event_fid1_position_name;
    variables.target_fiducials_itemNamesData.target_event_fid1_x_position = req.body.target_event_fid1_x_position;
    variables.target_fiducials_itemNamesData.target_event_fid1_y_position = req.body.target_event_fid1_y_position;
    variables.target_fiducials_itemNamesData.target_event_fid1_z_position = req.body.target_event_fid1_z_position;
    variables.target_fiducials_itemNamesData.target_event_fid1_experiment_date = req.body.target_event_fid1_experiment_date;
    variables.target_fiducials_itemNamesData.target_event_fid1_experiment_time = req.body.target_event_fid1_experiment_time;
    variables.target_fiducials_itemNamesData.target_event_fid2_validity = (req.body.target_event_fid2_validity ? true:false);
    variables.target_fiducials_itemNamesData.target_event_fid2_position_name = req.body.target_event_fid2_position_name;
    variables.target_fiducials_itemNamesData.target_event_fid2_x_position = req.body.target_event_fid2_x_position;
    variables.target_fiducials_itemNamesData.target_event_fid2_y_position = req.body.target_event_fid2_y_position;
    variables.target_fiducials_itemNamesData.target_event_fid2_z_position = req.body.target_event_fid2_z_position;
    variables.target_fiducials_itemNamesData.target_event_fid2_experiment_date = req.body.target_event_fid2_experiment_date;
    variables.target_fiducials_itemNamesData.target_event_fid1_experiment_time = req.body.target_event_fid1_experiment_time;
    variables.target_fiducials_itemNamesData.target_event_fid3_validity = (req.body.target_event_fid3_validity ? true:false);
    variables.target_fiducials_itemNamesData.target_event_fid3_position_name = req.body.target_event_fid3_position_name;
    variables.target_fiducials_itemNamesData.target_event_fid3_x_position = req.body.target_event_fid3_x_position;
    variables.target_fiducials_itemNamesData.target_event_fid3_y_position = req.body.target_event_fid3_y_position;
    variables.target_fiducials_itemNamesData.target_event_fid3_z_position = req.body.target_event_fid3_z_position;
    variables.target_fiducials_itemNamesData.target_event_fid3_experiment_date = req.body.target_event_fid3_experiment_date;
    variables.target_fiducials_itemNamesData.target_event_fid3_experiment_time = req.body.target_event_fid3_experiment_time;
    variables.target_data_itemNamesData.target_x_position = req.body.target_x_position;
    variables.target_data_itemNamesData.target_y_position = req.body.target_y_position;
    variables.target_data_itemNamesData.target_z_position = req.body.target_z_position;
    variables.target_data_itemNamesData.targetinfo_experiment_date = req.body.targetinfo_experiment_date;
    variables.target_data_itemNamesData.targetinfo_experiment_time = req.body.targetinfo_experiment_time;
    variables.target_data_itemNamesData.target_comments = req.body.target_comments;
    variables.target_data_itemNamesData.target_device = req.body.target_device;
    variables.target_data_itemNamesData.target_event_type = req.body.target_event_type;
    variables.target_data_itemNamesData.target_link_to_data = req.body.target_link_to_data;
    variables.target_data_itemNamesData.target_link_to_meta_data = req.body.target_link_to_meta_data;
    variables.target_data_itemNamesData.target_event_date = req.body.target_event_experiment_date;
    variables.target_data_itemNamesData.target_event_time = req.body.target_event_experiment_time;
    variables.target_data_itemNamesData.target_event_comments = req.body.target_event_comments;

    //console.log(req.body.target_event_experiment_date);
    //console.log(req.body.target_event_experiment_time);
    
    var db_query = [];
        
        if (!variables.subframe_data_itemNamesData.subframe_validity) {
            db_query = "UPDATE Subframe_Table SET Validity=0, InvalidSinceTimeStamp='" +  variables.subframe_data_itemNamesData.subframe_invalid_date + 
            " " + variables.subframe_data_itemNamesData.subframe_invalid_time + ":00' WHERE SubframeTypeID=(SELECT ID FROM SubframeType_Table WHERE TypeName='" + 
            variables.subframe_data_itemNamesData.subframe_type + "') AND FacilityID=(SELECT ID FROM Facility_Table WHERE CodeName='" +
            variables.subframe_data_itemNamesData.facility_name + "') AND SerialNumber=" + variables.subframe_data_itemNamesData.serial_number + ";";      
            
            connection.query(db_query, function (error, result) {
                if (error) throw error;
                console.log(result);
                res.redirect("/");
            }); 
        } else {
            console.log("inserting the subframe information to the database");
            var subframe_query = "UPDATE Subframe_Table SET Validity=1, GroupID=(SELECT ID FROM GroupInformation_Table WHERE GroupName='" + 
            variables.subframe_data_itemNamesData.group_name + "'), CreateTimeStamp='" + variables.subframe_data_itemNamesData.subframe_experiment_date + " " + 
            variables.subframe_data_itemNamesData.subframe_experiment_time + ":00', Comments='" + variables.subframe_data_itemNamesData.subframe_comments  + "' WHERE " + 
            "SubframeTypeID=(SELECT ID FROM SubframeType_Table WHERE TypeName='" + variables.subframe_data_itemNamesData.subframe_type + 
            "') AND FacilityID=(SELECT ID FROM Facility_Table WHERE CodeName='" + variables.subframe_data_itemNamesData.facility_name + "') AND SerialNumber=" +
            variables.subframe_data_itemNamesData.serial_number + "; ";

            connection.query(subframe_query, function (error, result) {
                if (error) throw error;
                //console.log(result);
            });

            console.log("inserting the subframe related fiducial information to the database");
            var subframe_event_fiducial1 = "INSERT INTO Fiducial_Table (Validity, PositionID, X, Y, Z, CreateTimeStamp) VALUES (" +
            variables.subframe_fiducials_itemNamesData.subframe_fid1_validity + ", (SELECT ID FROM FiducialPosition_Table WHERE PositionName='" + 
            variables.subframe_fiducials_itemNamesData.subframe_fid1_position_name + "'), " + variables.subframe_fiducials_itemNamesData.subframe_fid1_x_position + 
            ", " + variables.subframe_fiducials_itemNamesData.subframe_fid1_y_position + ", " + variables.subframe_fiducials_itemNamesData.subframe_fid1_z_position + 
            ", '" + variables.subframe_fiducials_itemNamesData.subframe_fid1_date + " " + variables.subframe_fiducials_itemNamesData.subframe_fid1_time + ":00'); ";

            var subframe_event_fiducial2 = "INSERT INTO Fiducial_Table (Validity, PositionID, X, Y, Z, CreateTimeStamp) VALUES (" +
            variables.subframe_fiducials_itemNamesData.subframe_fid2_validity + ", (SELECT ID FROM FiducialPosition_Table WHERE PositionName='" + 
            variables.subframe_fiducials_itemNamesData.subframe_fid2_position_name + "'), " + variables.subframe_fiducials_itemNamesData.subframe_fid2_x_position + 
            ", " + variables.subframe_fiducials_itemNamesData.subframe_fid2_y_position + ", " + variables.subframe_fiducials_itemNamesData.subframe_fid2_z_position + 
            ", '" + variables.subframe_fiducials_itemNamesData.subframe_fid2_date + " " + variables.subframe_fiducials_itemNamesData.subframe_fid2_time + ":00'); ";

            var subframe_event_fiducial3 = "INSERT INTO Fiducial_Table (Validity, PositionID, X, Y, Z, CreateTimeStamp) VALUES (" +
            variables.subframe_fiducials_itemNamesData.subframe_fid3_validity + ", (SELECT ID FROM FiducialPosition_Table WHERE PositionName='" + 
            variables.subframe_fiducials_itemNamesData.subframe_fid3_position_name + "'), " + variables.subframe_fiducials_itemNamesData.subframe_fid3_x_position + 
            ", " + variables.subframe_fiducials_itemNamesData.subframe_fid3_y_position + ", " + variables.subframe_fiducials_itemNamesData.subframe_fid3_z_position + 
            ", '" + variables.subframe_fiducials_itemNamesData.subframe_fid3_date + " " + variables.subframe_fiducials_itemNamesData.subframe_fid3_time + ":00'); ";

            var three_fids_correctly_added = false;
            subframe_fiducials_query = subframe_event_fiducial1 + subframe_event_fiducial2 + subframe_event_fiducial3;
            connection.query(subframe_fiducials_query, function (error, result) {
                            if (error) throw error;
                            three_fids_correctly_added = true;
                            //console.log(result);
            });

            if (three_fids_correctly_added) {
                var get_last_3_fids_query = "SELECT ID as ids FROM Fiducial_Table ORDER BY DBInsertTimeStamp DESC LIMIT 3";
                connection.query(get_last_3_fids_query, function (error, result) {
                    if (error) throw error;
                    id1 = result[0].ids;
                    id2 = result[1].ids;
                    id3 = result[2].ids;
    
                    var insert_fid_set_quey = "INSERT INTO FiducialSet_Table (FiducialID1, FiducialID2, FiducialID3) VALUES (" + id1 + ", " + id2 + ", " + id3 + "); ";
                    connection.query(insert_fid_set_quey, function (error, result) {
                        if (error) throw error;
                    });
                });
            }

            console.log("inserting the subframe event information to the database");
            var subframe_event_query = "INSERT INTO SubframeEvent_Table (SubframeID, FiducialSetID, DeviceID, LinkToData, " + 
            "LinkToMetaData, Comments, CreateTimeStamp, EventTypeID) VALUES ((SELECT ID FROM Subframe_Table WHERE SubframeTypeID=" +
            "(SELECT ID FROM SubframeType_Table WHERE TypeName='" + variables.subframe_data_itemNamesData.subframe_type + 
            "') AND FacilityID=(SELECT ID FROM Facility_Table WHERE CodeName='" + variables.subframe_data_itemNamesData.facility_name + 
            "') AND SerialNumber=" + variables.subframe_data_itemNamesData.serial_number + "), (SELECT ID FROM FiducialSet_Table ORDER BY ID DESC LIMIT 1), " + 
            "(SELECT ID FROM DeviceList_Table WHERE VendorName='" +
            variables.subframe_data_itemNamesData.subframe_device_select + "'), '" +
            variables.subframe_data_itemNamesData.subframe_link_to_data + "', '" + variables.subframe_data_itemNamesData.subframe_link_to_meta_data +
            "', '" + variables.subframe_data_itemNamesData.subframe_events_comments + "', '" + variables.subframe_data_itemNamesData.subframe_event_experiment_date +
            " " + variables.subframe_data_itemNamesData.subframe_event_experiment_time + ":00', (SELECT ID FROM EventType_Table WHERE EventType='" +
            variables.subframe_data_itemNamesData.subframe_event_select + "')); ";
            
            connection.query(subframe_event_query, function (error, result) {
                if (error) throw error;
            });

            console.log("inserting the ROI related information to the database");
            var roi_query = "INSERT INTO ROI_Table (SubframeID, ROITypeID, BoundingBoxPositionX, BoundingBoxPositionY, BoundingBoxWidth, BoundingBoxHeight, " +
             "MaskDirectory, Comments, CreateTimeStamp) VALUES (" + "(SELECT ID FROM Subframe_Table WHERE SubframeTypeID=" +
             "(SELECT ID FROM SubframeType_Table WHERE TypeName='" + variables.subframe_data_itemNamesData.subframe_type + 
             "') AND FacilityID=(SELECT ID FROM Facility_Table WHERE CodeName='" + variables.subframe_data_itemNamesData.facility_name + 
             "') AND SerialNumber=" + variables.subframe_data_itemNamesData.serial_number + "), " + "(SELECT ID FROM ROIType_Table WHERE Name='" + variables.roi_data_itemNamesData.roi_type + 
             "'), " + variables.roi_data_itemNamesData.roi_experiment_x_position + ", " + variables.roi_data_itemNamesData.roi_experiment_y_position + ", " +
             variables.roi_data_itemNamesData.roi_experiment_width + ", " + variables.roi_data_itemNamesData.roi_experiment_height + ", '" + 
             variables.roi_data_itemNamesData.roi_mask_load + "' , '" + variables.roi_data_itemNamesData.roi_experiment_comments + "', '" + 
             variables.roi_data_itemNamesData.roi_experiment_date + " " + variables.roi_data_itemNamesData.roi_experiment_time + ":00'" + ");";

            connection.query(roi_query, function (error, result) {
                if (error) throw error;
                //console.log(result);
            });

            console.log("inserting the ROI related fiducial information to the database");
            var roi_event_fiducial1 = "INSERT INTO Fiducial_Table (Validity, PositionID, X, Y, Z, CreateTimeStamp) VALUES (" +
            variables.roi_fiducials_itemNamesData.roi_event_fid1_validity + ", (SELECT ID FROM FiducialPosition_Table WHERE PositionName='" + 
            variables.roi_fiducials_itemNamesData.roi_event_fid1_position_name + "'), " + variables.roi_fiducials_itemNamesData.roi_event_fid1_x_position + 
            ", " + variables.roi_fiducials_itemNamesData.roi_event_fid1_y_position + ", " + variables.roi_fiducials_itemNamesData.roi_event_fid1_z_position + 
            ", '" + variables.roi_fiducials_itemNamesData.roi_event_fid1_experiment_date + " " + variables.roi_fiducials_itemNamesData.roi_event_fid1_experiment_time + ":00'); ";

            var roi_event_fiducial2 = "INSERT INTO Fiducial_Table (Validity, PositionID, X, Y, Z, CreateTimeStamp) VALUES (" +
            variables.roi_fiducials_itemNamesData.roi_event_fid2_validity + ", (SELECT ID FROM FiducialPosition_Table WHERE PositionName='" + 
            variables.roi_fiducials_itemNamesData.roi_event_fid2_position_name + "'), " + variables.roi_fiducials_itemNamesData.roi_event_fid2_x_position + 
            ", " + variables.roi_fiducials_itemNamesData.roi_event_fid2_y_position + ", " + variables.roi_fiducials_itemNamesData.roi_event_fid2_z_position + 
            ", '" + variables.roi_fiducials_itemNamesData.roi_event_fid2_experiment_date + " " + variables.roi_fiducials_itemNamesData.roi_event_fid2_experiment_time + ":00'); ";

            var roi_event_fiducial3 = "INSERT INTO Fiducial_Table (Validity, PositionID, X, Y, Z, CreateTimeStamp) VALUES (" +
            variables.roi_fiducials_itemNamesData.roi_event_fid3_validity + ", (SELECT ID FROM FiducialPosition_Table WHERE PositionName='" + 
            variables.roi_fiducials_itemNamesData.roi_event_fid3_position_name + "'), " + variables.roi_fiducials_itemNamesData.roi_event_fid3_x_position + 
            ", " + variables.roi_fiducials_itemNamesData.roi_event_fid3_y_position + ", " + variables.roi_fiducials_itemNamesData.roi_event_fid3_z_position + 
            ", '" + variables.roi_fiducials_itemNamesData.roi_event_fid3_experiment_date + " " + variables.roi_fiducials_itemNamesData.roi_event_fid3_experiment_time + ":00'); ";

            three_fids_correctly_added = false;
            roi_fiducials_query = roi_event_fiducial1 + roi_event_fiducial2 + roi_event_fiducial3;
            connection.query(roi_fiducials_query, function (error, result) {
                            if (error) throw error;
                            three_fids_correctly_added = true;
                            //console.log(result);
            });

            if (three_fids_correctly_added) {
                var get_last_3_fids_query = "SELECT ID as ids FROM Fiducial_Table ORDER BY DBInsertTimeStamp DESC LIMIT 3";
                connection.query(get_last_3_fids_query, function (error, result) {
                    if (error) throw error;
                    id1 = result[0].ids;
                    id2 = result[1].ids;
                    id3 = result[2].ids;
                    var insert_fid_set_quey = "INSERT INTO FiducialSet_Table (FiducialID1, FiducialID2, FiducialID3) VALUES (" + id1 + ", " + id2 + ", " + id3 + "); ";
                    connection.query(insert_fid_set_quey, function (error, result) {
                        if (error) throw error;
                    });
                });
            }

            console.log("inserting the ROI event information to the database");
            console.log("*** we assume that the event corresponds to the ID of the last ROI added ***");
            var roi_event_query = "INSERT INTO ROIEvent_Table (ROIID, EventTypeID, FiducialSetID, DeviceID, " + 
            "LinkToData, LinkToMetaData, Comments, CreateTimeStamp) VALUES ((SELECT ID FROM ROI_Table ORDER BY ID LIMIT 1), (SELECT ID FROM EventType_Table WHERE EventType='" +
            variables.roi_data_itemNamesData.roi_event_type + "'), (SELECT ID FROM FiducialSet_Table ORDER BY ID DESC LIMIT 1), " + "(SELECT ID FROM DeviceList_Table WHERE VendorName='" +
            variables.roi_data_itemNamesData.roi_device + "'), '" + variables.roi_data_itemNamesData.roi_event_link_to_data + "', '" + variables.roi_data_itemNamesData.roi_event_link_to_meta_data +
            "', '" + variables.roi_data_itemNamesData.roi_event_comments + "', '" + variables.roi_data_itemNamesData.roi_event_date +
            " " + variables.roi_data_itemNamesData.roi_event_time + ":00'); ";

            connection.query(roi_event_query, function (error, result) {
                if (error) throw error;
            });
            
            console.log("inserting the sample related information to the database");
            var sample_query = "INSERT INTO Sample_Table (ROIID, BoundingBoxPositionX, BoundingBoxPositionY, BoundingBoxWidth, BoundingBoxHeight, " +
            "Theta, Phi, Rho, MaskDirectory, Comments, CreateTimeStamp) VALUES (" + "(SELECT ID FROM ROI_Table ORDER BY DBInsertTimeStamp DESC LIMIT 1), " +
            + variables.sample_data_itemNamesData.sample_experiment_x_position + ", " + variables.sample_data_itemNamesData.sample_experiment_y_position + ", " +
            variables.sample_data_itemNamesData.sample_experiment_width + ", " + variables.sample_data_itemNamesData.sample_experiment_height + ", " + 
            variables.sample_data_itemNamesData.sample_experiment_theta + ", " + variables.sample_data_itemNamesData.sample_experiment_phi + ", " +
            variables.sample_data_itemNamesData.sample_experiment_rho + ", '" + variables.sample_data_itemNamesData.sample_mask_load + "' , '" + 
            variables.sample_data_itemNamesData.sample_experiment_comments + "', '" + variables.sample_data_itemNamesData.sample_experiment_date + " " + 
            variables.sample_data_itemNamesData.sample_experiment_time + ":00'" + ");";

            connection.query(sample_query, function (error, result) {
                if (error) throw error;
                //console.log(result);
            });

            console.log("inserting the sample related fiducial information to the database");
            var sample_event_fiducial1 = "INSERT INTO Fiducial_Table (Validity, PositionID, X, Y, Z, CreateTimeStamp) VALUES (" +
            variables.sample_fiducials_itemNamesData.sample_event_fid1_validity + ", (SELECT ID FROM FiducialPosition_Table WHERE PositionName='" + 
            variables.sample_fiducials_itemNamesData.sample_event_fid1_position_name + "'), " + variables.sample_fiducials_itemNamesData.sample_event_fid1_x_position + 
            ", " + variables.sample_fiducials_itemNamesData.sample_event_fid1_y_position + ", " + variables.sample_fiducials_itemNamesData.sample_event_fid1_z_position + 
            ", '" + variables.sample_fiducials_itemNamesData.sample_event_fid1_experiment_date + " " + variables.sample_fiducials_itemNamesData.sample_event_fid1_experiment_time + ":00'); ";

            var sample_event_fiducial2 = "INSERT INTO Fiducial_Table (Validity, PositionID, X, Y, Z, CreateTimeStamp) VALUES (" +
            variables.sample_fiducials_itemNamesData.sample_event_fid2_validity + ", (SELECT ID FROM FiducialPosition_Table WHERE PositionName='" + 
            variables.sample_fiducials_itemNamesData.sample_event_fid2_position_name + "'), " + variables.sample_fiducials_itemNamesData.sample_event_fid2_x_position + 
            ", " + variables.sample_fiducials_itemNamesData.sample_event_fid2_y_position + ", " + variables.sample_fiducials_itemNamesData.sample_event_fid2_z_position + 
            ", '" + variables.sample_fiducials_itemNamesData.sample_event_fid2_experiment_date + " " + variables.sample_fiducials_itemNamesData.sample_event_fid2_experiment_time + ":00'); ";

            var sample_event_fiducial3 = "INSERT INTO Fiducial_Table (Validity, PositionID, X, Y, Z, CreateTimeStamp) VALUES (" +
            variables.sample_fiducials_itemNamesData.sample_event_fid3_validity + ", (SELECT ID FROM FiducialPosition_Table WHERE PositionName='" + 
            variables.sample_fiducials_itemNamesData.sample_event_fid3_position_name + "'), " + variables.sample_fiducials_itemNamesData.sample_event_fid3_x_position + 
            ", " + variables.sample_fiducials_itemNamesData.sample_event_fid3_y_position + ", " + variables.sample_fiducials_itemNamesData.sample_event_fid3_z_position + 
            ", '" + variables.sample_fiducials_itemNamesData.sample_event_fid3_experiment_date + " " + variables.sample_fiducials_itemNamesData.sample_event_fid3_experiment_time + ":00'); ";

            three_fids_correctly_added = false;
            sample_fiducials_query = sample_event_fiducial1 + sample_event_fiducial2 + sample_event_fiducial3;
            connection.query(sample_fiducials_query, function (error, result) {
                            if (error) throw error;
                            three_fids_correctly_added = true;
                            //console.log(result);
            });

            if (three_fids_correctly_added) {
                var get_last_3_fids_query = "SELECT ID as ids FROM Fiducial_Table ORDER BY DBInsertTimeStamp DESC LIMIT 3";
                connection.query(get_last_3_fids_query, function (error, result) {
                    if (error) throw error;
                    id1 = result[0].ids;
                    id2 = result[1].ids;
                    id3 = result[2].ids;
                
                    var insert_fid_set_quey = "INSERT INTO FiducialSet_Table (FiducialID1, FiducialID2, FiducialID3) VALUES (" + id1 + ", " + id2 + ", " + id3 + "); ";
                    connection.query(insert_fid_set_quey, function (error, result) {
                        if (error) throw error;
                    });
                });
            }

            console.log("inserting the sample event information to the database");
            console.log("*** we assume that the event corresponds to the ID of the last Sample added ***");
            var sample_event_query = "INSERT INTO SampleEvent_Table (SampleID, EventTypeID, FiducialSetID, DeviceID, " + 
            "LinkToData, LinkToMetaData, Comments, CreateTimeStamp) VALUES ((SELECT ID FROM Sample_Table ORDER BY ID LIMIT 1), (SELECT ID FROM EventType_Table WHERE EventType='" +
            variables.sample_data_itemNamesData.sample_event_type + "'), (SELECT ID FROM FiducialSet_Table ORDER BY ID DESC LIMIT 1), " + "(SELECT ID FROM DeviceList_Table WHERE VendorName='" +
            variables.sample_data_itemNamesData.sample_device + "'), '" + variables.sample_data_itemNamesData.sample_event_link_to_data + "', '" + variables.sample_data_itemNamesData.sample_event_link_to_meta_data +
            "', '" + variables.sample_data_itemNamesData.sample_event_comments + "', '" + variables.sample_data_itemNamesData.sample_event_date +
            " " + variables.sample_data_itemNamesData.sample_event_time + ":00'); ";

            connection.query(sample_event_query, function (error, result) {
                if (error) throw error;
            });

            console.log("inserting the target related information to the database");
            var target_query = "INSERT INTO Target_Table (SampleID, X, Y, Z, Comments, CreateTimeStamp) VALUES (" + 
            "(SELECT ID FROM Sample_Table ORDER BY DBInsertTimeStamp DESC LIMIT 1), " +
            + variables.target_data_itemNamesData.target_x_position + ", " + variables.target_data_itemNamesData.target_y_position + ", " +
            variables.target_data_itemNamesData.target_z_position + ", '" + variables.target_data_itemNamesData.target_comments + "', '" + 
            variables.target_data_itemNamesData.targetinfo_experiment_date + " " + variables.target_data_itemNamesData.targetinfo_experiment_time + ":00'" + ");";

            connection.query(target_query, function (error, result) {
                if (error) throw error;
                //console.log(result);
            });

            console.log("inserting the target related fiducial information to the database");
            var target_event_fiducial1 = "INSERT INTO Fiducial_Table (Validity, PositionID, X, Y, Z, CreateTimeStamp) VALUES (" +
            variables.target_fiducials_itemNamesData.target_event_fid1_validity + ", (SELECT ID FROM FiducialPosition_Table WHERE PositionName='" + 
            variables.target_fiducials_itemNamesData.target_event_fid1_position_name + "'), " + variables.target_fiducials_itemNamesData.target_event_fid1_x_position + 
            ", " + variables.target_fiducials_itemNamesData.target_event_fid1_y_position + ", " + variables.target_fiducials_itemNamesData.target_event_fid1_z_position + 
            ", '" + variables.target_fiducials_itemNamesData.target_event_fid1_experiment_date + " " + variables.target_fiducials_itemNamesData.target_event_fid1_experiment_time + ":00'); ";

            var target_event_fiducial2 = "INSERT INTO Fiducial_Table (Validity, PositionID, X, Y, Z, CreateTimeStamp) VALUES (" +
            variables.target_fiducials_itemNamesData.target_event_fid2_validity + ", (SELECT ID FROM FiducialPosition_Table WHERE PositionName='" + 
            variables.target_fiducials_itemNamesData.target_event_fid2_position_name + "'), " + variables.target_fiducials_itemNamesData.target_event_fid2_x_position + 
            ", " + variables.target_fiducials_itemNamesData.target_event_fid2_y_position + ", " + variables.target_fiducials_itemNamesData.target_event_fid2_z_position + 
            ", '" + variables.target_fiducials_itemNamesData.target_event_fid2_experiment_date + " " + variables.target_fiducials_itemNamesData.target_event_fid2_experiment_time + ":00'); ";

            var target_event_fiducial3 = "INSERT INTO Fiducial_Table (Validity, PositionID, X, Y, Z, CreateTimeStamp) VALUES (" +
            variables.target_fiducials_itemNamesData.target_event_fid3_validity + ", (SELECT ID FROM FiducialPosition_Table WHERE PositionName='" + 
            variables.target_fiducials_itemNamesData.target_event_fid3_position_name + "'), " + variables.target_fiducials_itemNamesData.target_event_fid3_x_position + 
            ", " + variables.target_fiducials_itemNamesData.target_event_fid3_y_position + ", " + variables.target_fiducials_itemNamesData.target_event_fid3_z_position + 
            ", '" + variables.target_fiducials_itemNamesData.target_event_fid3_experiment_date + " " + variables.target_fiducials_itemNamesData.target_event_fid3_experiment_time + ":00'); ";

            three_fids_correctly_added = false;
            target_fiducials_query = target_event_fiducial1 + target_event_fiducial2 + target_event_fiducial3;
            connection.query(target_fiducials_query, function (error, result) {
                            if (error) throw error;
                            three_fids_correctly_added = true;
                            //console.log(result);
            });

            if (three_fids_correctly_added) {
                var get_last_3_fids_query = "SELECT ID as ids FROM Fiducial_Table ORDER BY DBInsertTimeStamp DESC LIMIT 3";
                connection.query(get_last_3_fids_query, function (error, result) {
                    if (error) throw error;
                    id1 = result[0].ids;
                    id2 = result[1].ids;
                    id3 = result[2].ids;
                    var insert_fid_set_quey = "INSERT INTO FiducialSet_Table (FiducialID1, FiducialID2, FiducialID3) VALUES (" + id1 + ", " + id2 + ", " + id3 + "); ";
                    connection.query(insert_fid_set_quey, function (error, result) {
                        if (error) throw error;
                    });
                });
            }

            console.log("inserting the target event information to the database");
            console.log("*** we assume that the event corresponds to the ID of the last target added ***");
            var target_event_query = "INSERT INTO TargetEvent_Table (TargetID, EventTypeID, FiducialSetID, DeviceID, " + 
            "LinkToData, LinkToMetaData, Comments, CreateTimeStamp) VALUES ((SELECT ID FROM Target_Table ORDER BY ID LIMIT 1), (SELECT ID FROM EventType_Table WHERE EventType='" +
            variables.target_data_itemNamesData.target_event_type + "'), (SELECT ID FROM FiducialSet_Table ORDER BY ID DESC LIMIT 1), " + "(SELECT ID FROM DeviceList_Table WHERE VendorName='" +
            variables.target_data_itemNamesData.target_device + "'), '" + variables.target_data_itemNamesData.target_link_to_data + "', '" + 
            variables.target_data_itemNamesData.target_link_to_meta_data + "', '" + variables.target_data_itemNamesData.target_event_comments + 
            "', '" + variables.target_data_itemNamesData.target_event_date + " " + variables.target_data_itemNamesData.target_event_time + ":00'); ";
            
            console.log(target_event_query);

            connection.query(target_event_query, function (error, result) {
                if (error) throw error;
                console.log("Finished");            
                res.redirect("/");
            });
        }
});






































// ******************************************************************************************************************************************************************


app.post("/submitXMLFile", function(req, res){
    // Find count of Subframes in DB and Respond with that count
    //var q = "SELECT COUNT(*) as count FROM Subframe; SELECT MAX(SerialNumber)+1 as max_sr FROM Subframe;";
    //connection.query(q, function(err, results){
    //    if(err) throw err;
    //    var count = results[0][0].count;
    //    serial_number = count+1;
    //    var max_sr = results[1][0].max_sr; // maximum serial number + 1
        fs.readFile(req.body.xmlFile, function(err, data){
            //xml_data = data;
            xmlParser.parseString(data, function(xml_err, result){
                if(xml_err)
                    console.log(xml_err);
                // console.log(result['experiment']['subframe'][0]['roi']);
                res.render("home_xml_data", {xml_data: result['experiment']['subframe'][0]});
                
                //console.dir(result.experiment.subframe[0].Comments);
                //console.dir(result.experiment.overviewimage[0].MicroscopeType);
                //assignTheValues(result);
                //console.dir(result.experiment.subframe[0].GroupName);
                //console.dir(result.experiment.fiducials[0].fiducial1[0].Validity);
                //console.dir(result.experiment.fiducials[0].fiducial1);
                //console.log('Read finished!');
                // Looks for "home.ejs", and by default it is looking in "view"
                
                
                /*
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
                });   */    
            });
        });
    //});
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

app.get("/login", function(req, res){
    res.render('login', { message: req.flash('loginMessage') });
});

app.get('/register', function(req, res) {
    res.render('register', { message: req.flash('registerMessage') });
});

passport.serializeUser(function(user, done) {
    done(null, user);
});
  
passport.deserializeUser(function(user, done) {
    done(null, user);
});


passport.use(
    'local-login',
    new LocalStrategy({
        // by default, local strategy uses username and password, we will override with email
        usernameField : 'username',
        passwordField : 'password',
        passReqToCallback : true // allows us to pass back the entire request to the callback
    },
    function(req, username, password, done) { // callback with email and password from our form
        //connection.connect();
        connection.query("SELECT * FROM Users_Table WHERE EmailAddress = ?",[username], function(err, rows){
            if (err)
                return done(err);
            if (!rows.length) {
                return done(null, false, req.flash('loginMessage', 'No user found.')); // req.flash is the way to set flashdata using connect-flash
            }

            // if the user is found but the password is wrong
            console.log(password);
            console.log(rows[0]);
            
            if (!bcrypt.compare(password, rows[0].Password)){
                console.log("Hello");
                return done(null, false, req.flash('loginMessage', 'Oops! Wrong password.')); // create the loginMessage and save it to session as flashdata
            }
            // all is well, return successful user
            return done(null, rows[0]);
        });
        //connection.end();
    })
);

passport.use(
    'local-signup',
    new LocalStrategy({
        usernameField : 'username',
        passwordField : 'password',
        passReqToCallback : true 
    },
    function(req, username, password, done) {
        //connection.connect();
        connection.query("SELECT * FROM Users_Table WHERE EmailAddress = ?",[username], function(err, rows) {
            if (err)
                return done(err);
            if (rows.length) {
                return done(null, false, req.flash('signupMessage', 'That username is already taken!'));
            } else {
                var newUserMysql = {
                    username: username,
                    password: bcrypt.hashSync(password, 10) //null, null)  
                };

                var insertQuery = "INSERT INTO Users_Table ( EmailAddress, Password ) values (?,?)";
                //connection.connect();
                connection.query(insertQuery,[newUserMysql.username, newUserMysql.password],function(err, rows) {
                    newUserMysql.id = rows.insertId;
                    return done(null, newUserMysql);
                });
                //connection.end();
            }
        });
        //connection.end();
    })
);

app.post('/register', passport.authenticate('local-signup', {
        successRedirect : '/login', // redirect to the secure profile section
        failureRedirect : '/register', // redirect back to the signup page if there is an error
        failureFlash : false // allow flash messages
    }));

app.post('/login', passport.authenticate('local-login', {
        successRedirect : '/editTables', // redirect to the secure profile section
        failureRedirect : '/login', // redirect back to the signup page if there is an error
        failureFlash : true // allow flash messages
    }),
    function(req, res) {
        console.log("hello");

        if (req.body.remember) {
          req.session.cookie.maxAge = 1000 * 60 * 3;
        } else {
          req.session.cookie.expires = false;
        }
    res.redirect('/');
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

