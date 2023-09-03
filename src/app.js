require('dotenv').config();
const express = require('express');
const bodyParser = require("body-parser");
const ejs = require("ejs");
const app = express();
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));
app.use(express.static(__dirname + "/imgs"));
app.use(express.static(__dirname + "/js_files"));

const {BaseClass} = require('./js_files/utils');
const {Subframe} = require('./js_files/subframe');

app.use(bodyParser.urlencoded({extended: true}));
//#############################################################################
// database connection
let mysql = require('mysql'); 
let connection = mysql.createConnection({
    host	            : process.env.HOST_NAME, 
    user	            : process.env.DB_USER,
    database            : process.env.DB_NAME,
    password            : process.env.DB_PWD,
    multipleStatements  : true
});
//#############################################################################
// load home page
app.get("/", function(_req, res){
    res.render("home");
});
//#############################################################################
// create subframe page
var baseclass = new BaseClass();
app.get("/createSubframe", function(req, res){
    console.log('\nthe user attempts to create a subframe...');

    let query = baseclass.getEnumTablesQuery();
    connection.query(query, function(error, result){
        if (error)
            throw error;

        baseclass.digestEnumValues(result);

        let subframe_table = baseclass.enum_tables_list['SubframeType_Table'];
        let facility_table = baseclass.enum_tables_list['Facility_Table'];      

        res.render("create_subframe/get_subframe_id", {
            subframe_table,
            facility_table
        });
    });
});
//#############################################################################
// generate the list of subframes available in the database
var subframe = new Subframe();
app.get("/submitDataManually", function(req, res){
    console.log('\nthe user attempts to submit the data manually...');

    let query = baseclass.getEnumTablesQuery();
    connection.query(query, function(error, result){
        if (error)
            throw error;

        baseclass.digestEnumValues(result);
        query = subframe.getSubframesQuery();

        connection.query(query, function(error, result){
            if (error)
                throw error;

            subframe.generateSubframeIDs(baseclass.enum_tables_list,
                                         result);

            Subframe_IDs = subframe.subframeids;

            res.render("manual_insertion/home_manual_data_insertion", {
                Subframe_IDs
            });
        });
    });
});
//#############################################################################
// submit the subframe information
app.post("/insertSubframeInformationManually", function(req, res){
    console.log('\nthe user attempts to insert the subframe data...');

    if(req.body['insert_subframe_information'] == 0)
        subframe.external_id = req.body['filters_subframe'];
    
    subframe.findSubframeInternalID();
     
    let query = "SELECT * FROM Subframe_Table WHERE ID=" +
                subframe.internal_id.toString() + "; ";
    query += "SELECT * FROM ROI_Table WHERE SubframeID=" +
                subframe.internal_id.toString() + "; "; 

    connection.query(query, function(error, result) {
        if (error)
            throw error;

        subframe.generateSubframeHeader(baseclass.enum_tables_list,
                                        result[0]);
        subframe.generateROIIDs(result[1]);

        let external_id = subframe.external_id;
        let subframe_header = subframe.header;
        let subframe_rois = subframe.rois;

        res.render("manual_insertion/home_manually_subframe", {
            external_id,
            subframe_header,
            subframe_rois
        });
    });
});
//#############################################################################
// add/edit subframe header information
app.get("/addSubframeInformation", function(req, res){
    console.log('\nthe user attempts to add/edit subframe header information');

    let external_id = subframe.external_id;
    let groups = baseclass.enum_tables_list['GroupInformation_Table'];
    let subframe_header = subframe.header;

    res.render("manual_insertion/add_subframe_information", {
        external_id,
        groups,
        subframe_header
    });
});
//#############################################################################
// add/edit subframe header information
app.post("/submitSubframeInformation", function(req, res){
    console.log('\nthe user submits the subframe header information');

    let query = "UPDATE Subframe_Table SET ";
    if(typeof req.body['subframe_validity']==='undefined'){
        query += "Validity=0, InvalidSinceTimeStamp='" +
            req.body['invalidity_date'] + " " +
            req.body['invalidity_time'] + ":00' ";
    } else {
        query += "Validity=1 ";
    }

    if(req.body['comments'] != '')
        query += ", Comments='" + req.body['comments'] + "' ";

    if(req.body['filters_group'] != 'Not Specified'){
        query += ", GroupID=" + baseclass.getGroupID(req.body['filters_group']) + " ";
    }

    query += "WHERE ID=" + subframe.internal_id.toString();

    connection.query(query, function(error, result){
        if(error)
            throw error;

        res.redirect(307, '/insertSubframeInformationManually');
    });
});
//#############################################################################
// create subframe event
app.get("/createSubframeEvent", function(req, res){
    console.log('\nthe user attempts to create subframe event');

    let external_id = subframe.external_id;
    let device_lists = baseclass.enum_tables_list['DeviceList_Table'];
    let event_types = baseclass.enum_tables_list['EventType_Table'];
    let fiducial_positions = baseclass.enum_tables_list['FiducialPosition_Table'];

    res.render("manual_insertion/create_subframe_event", {
        external_id,
        device_lists,
        event_types,
        fiducial_positions
    });
});

//#############################################################################
// submit subframe event
app.post("/submitSubframeEvent", function(req, res){
    console.log('\nthe user submitted the subframe event');

    // ToDo: the codes in this section are redundant,
    // create function for it...

    let query = "";
    if (req.body['fid1_validity'] == 'on'){
        query += "INSERT INTO Fiducial_Table (";
        let position_id = baseclass.getFiducialPositionID(req.body['fid1_position_name']);
        query += "Validity, PositionID, X, Y, Z) VALUES (1, " + position_id.toString() +
                ", " + req.body['fid1_x_position'].toString() + ", " +
                req.body['fid1_y_position'].toString() + ", " +
                req.body['fid1_z_position'].toString() + "); ";
    }

    if (req.body['fid2_validity'] == 'on'){
        query += "INSERT INTO Fiducial_Table (";
        let position_id = baseclass.getFiducialPositionID(req.body['fid2_position_name']);
        query += "Validity, PositionID, X, Y, Z) VALUES (1, " + position_id.toString() +
                ", " + req.body['fid2_x_position'].toString() + ", " +
                req.body['fid2_y_position'].toString() + ", " +
                req.body['fid2_z_position'].toString() + "); ";
    }

    if (req.body['fid3_validity'] == 'on'){
        query += "INSERT INTO Fiducial_Table (";
        let position_id = baseclass.getFiducialPositionID(req.body['fid3_position_name']);
        query += "Validity, PositionID, X, Y, Z) VALUES (1, " + position_id.toString() +
                ", " + req.body['fid3_x_position'].toString() + ", " +
                req.body['fid3_y_position'].toString() + ", " +
                req.body['fid3_z_position'].toString() + "); ";
    }

    if (req.body['fid4_validity'] == 'on'){
        query += "INSERT INTO Fiducial_Table (";
        let position_id = baseclass.getFiducialPositionID(req.body['fid4_position_name']);
        query += "Validity, PositionID, X, Y, Z) VALUES (1, " + position_id.toString() +
                ", " + req.body['fid4_x_position'].toString() + ", " +
                req.body['fid4_y_position'].toString() + ", " +
                req.body['fid4_z_position'].toString() + "); ";
    }

    connection.query(query, function(error, result){
        if (error)
            throw error;

        if(result.length==4){
            query = "INSERT INTO FiducialSet_Table (FiducialID1, FiducialID2, FiducialID3, FiducialID4) VALUES (" +
                    result[0]['insertId'] + ", " + result[1]['insertId'] + ", " + result[2]['insertId'] + ", " +
                    result[3]['insertId'] + "); ";
        } else {
            query = "INSERT INTO FiducialSet_Table (FiducialID1, FiducialID2, FiducialID3) VALUES (" +
            result[0]['insertId'] + ", " + result[1]['insertId'] + ", " + result[2]['insertId'] + "); ";
        }

        connection.query(query, function(error, result){
            if (error)
                throw error;

            let fiducialset_id = result['insertId'];
            query = "INSERT INTO SubframeEvent_Table (SubframeID, FiducialSetID";
            
            let device_id = "";
            if(req.body['device_name'] != "Choose..."){
                query += ", DeviceID";
                device_id = baseclass.getDeviceID(req.body['device_name']);
            }

            if(req.body['event_link_to_data'] != '')
                query += ", LinkToData";

            if(req.body['event_link_to_meta_data'] != '')
                query += ", LinkToMetaData";

            if(req.body['event_comments'] != '')
                query += ", Comments";

            let event_id = baseclass.getEventID(req.body['event_name']);

            query += ", EventTypeID, CreateTimeStamp) VALUES (";

            query += subframe.internal_id.toString() + ", " +
                fiducialset_id.toString();
            
            if(device_id != "")
                query +=  ", " + device_id.toString();

            if(req.body['event_link_to_data'] != '')
                query += ", " + req.body['event_link_to_data'];

            if(req.body['event_link_to_meta_data'] != '')
                query += ", " + req.body['event_link_to_meta_data'];

            if(req.body['event_comments'] != '')
                query += ", " + req.body['event_comments'];

            query += ", " + event_id.toString() + ", '" + req.body['event_date'] +
                    " " + req.body['event_time'] + ":00'); ";

            connection.query(query, function(error, result){
                if (error)
                    throw error;

                res.redirect(307, '/insertSubframeInformationManually');
            });
        });
    });
});
//#############################################################################
// create ROI
app.get("/createSubframeROI", function(req, res){
    console.log('\nthe user attempts to create ROI');

    let external_id = subframe.external_id;
    let roi_types = baseclass.enum_tables_list['ROIType_Table'];

    res.render("manual_insertion/create_roi", {
        external_id,
        roi_types
    });
});
//#############################################################################
// submit ROI information
app.post("/submitROIInformation", function(req, res){
    console.log('\nthe user submits the ROI information');

    let roi_type_id = baseclass.getROITypeID(req.body['roi_type']);
    let query = "INSERT INTO ROI_Table (SubframeID, ROITypeID";

    if(req.body['mask_directory'] != '')
        query += ", MaskDirectory";
    if(req.body['roi_x_position'] != '')
        query += ", BoundingBoxPositionX";
    if(req.body['roi_y_position'] != '')
        query += ", BoundingBoxPositionY";
    if(req.body['roi_width'] != '')
        query += ", BoundingBoxWidth";
    if(req.body['roi_height'] != '')
        query += ", BoundingBoxHeight";
    if(req.body['roi_comments'] != '')
        query += ", Comments";
    query += ", CreateTimeStamp) VALUES (";

    query += subframe.internal_id.toString() + ", " +
            roi_type_id.toString();
    
    if(req.body['mask_directory'] != '')
        query += ", " + req.body['mask_directory'];
    if(req.body['roi_x_position'] != '')
        query += ", " + req.body['roi_x_position'];
    if(req.body['roi_y_position'] != '')
        query += ", " + req.body['roi_y_position'];
    if(req.body['roi_width'] != '')
        query += ", " + req.body['roi_width'];
    if(req.body['roi_height'] != '')
        query += ", " + req.body['roi_height'];
    if(req.body['roi_comments'] != '')
        query += ", " + req.body['roi_comments'];
    query += ", '" + req.body['roi_date'] + " " + req.body['roi_time'] + ":00'); ";

    console.log(query);

    connection.query(query, function(error, result){
        if(error)
            throw error;

        res.redirect(307, '/insertSubframeInformationManually');
    });
});
//#############################################################################
// create target
app.get("/createTarget", function(req, res){
    console.log('\nthe user attempts to create target directly on the Subframe');

    let external_id = subframe.external_id;
    
    res.render("manual_insertion/create_target", {
        external_id
    });
});
//#############################################################################
// submit target information
app.post("/submitTargetInformation", function(req, res){
    console.log('\nthe user submits the target information');

    if(req.body['submit_information_for_target'] == 0){
        console.log('\nthe user creates target directly on the subframe');

        let query = "SELECT * FROM ROI_Table WHERE SubframeID=" + subframe.internal_id.toString() +
                    " AND Comments='00000_DEFAULT'; ";

        connection.query(query, function(error, result){
            if(error)
                throw error;

            if(result.length == 0){
                query = "INSERT INTO ROI_Table (SubframeID, ROITypeID, CreateTimeStamp, Comments) VALUES (" +
                        subframe.internal_id.toString() + ", 1, '2023-08-30 00:00:00', '00000_DEFAULT'); ";
                
                connection.query(query, function(error, result){
                    if(error)
                        throw error;

                    query = "INSERT INTO Sample_Table (ROIID, CreateTimeStamp, Comments) VALUES (" +
                            result.insertId + ", '2023-08-30 00:00:00', '00000_DEFAULT'); ";
                    
                    connection.query(query, function(error, result){
                        if(error)
                            throw error;

                        query = "INSERT INTO Target_Table (SampleID, X, Y, Z, CreateTimeStamp";

                        if(req.body['target_comments'] != '')
                            query += ", Comments";

                        query += ") VALUES (" + result.insertId + ", " + req.body['target_x_position'] +
                                ", " + req.body['target_y_position'] + ", " + req.body['target_z_position'] + ", '" +
                                req.body['target_date'] + " " + req.body['target_time'] + ":00'";
                        
                        if(req.body['target_comments'] != '')
                            query += ", '" + req.body['target_comments'] + "'";

                        query += "); ";

                        connection.query(query, function(error, result){
                            if(error)
                                throw error;

                            res.redirect(307, '/insertSubframeInformationManually');
                        });
                    });
                });
            } else {
                query = "SELECT ID FROM Sample_Table WHERE ROIID=" + result[0]['ID'] + " AND Comments='00000_DEFAULT'; ";

                connection.query(query, function(error, result){
                    if(error)
                        throw error;
                    
                    query = "INSERT INTO Target_Table (SampleID, X, Y, Z, CreateTimeStamp";

                    if(req.body['target_comments'] != '')
                        query += ", Comments";

                    query += ") VALUES (" + result[0]['ID'] + ", " + req.body['target_x_position'] +
                            ", " + req.body['target_y_position'] + ", " + req.body['target_z_position'] + ", '" +
                            req.body['target_date'] + " " + req.body['target_time'] + ":00'";
                    
                    if(req.body['target_comments'] != '')
                        query += ", '" + req.body['target_comments'] + "'";

                    query += "); ";

                    connection.query(query, function(error, result){
                        if(error)
                            throw error;

                        res.redirect(307, '/insertSubframeInformationManually');
                    });
                });
            }
        });
    } else {
        console.log("\nthe target is inserted from the Sample Page...");
    }
});
























//#############################################################################
// create subframe on the database
app.post("/createSubframeOnDatabase", function(req, res){
    console.log('\nprocessing the request (connecting to the database)...');

    let facility_id = baseclass.getFacilityID(req.body['facility_name_select']);
    let subframe_type_id = baseclass.getSubframeTypeID(req.body['subframe_type_select']);
    
    let query = "SELECT MAX(SerialNumber)+1 as serialnumber " + 
        "FROM Subframe_Table WHERE SubframeTypeID=" + subframe_type_id +
        " AND FacilityID=" + facility_id + "; ";

    connection.query(query, function (error, result) {
        if (error)
            throw error;
        
        let serial_number = result[0].serialnumber;
        let serial_number_text = baseclass.getSubframeSerialNumber(serial_number);

        query = "INSERT INTO Subframe_Table (FacilityID, " +
                "SubframeTypeID, SerialNumber, Validity) VALUES (" +
                facility_id.toString() + ", " + subframe_type_id.toString() +
                ", " + result[0].serialnumber.toString() + ", 1); ";
        
        connection.query(query, function (error, result) {
            if (error)
                throw error;

            let facility_code_name = baseclass.getFacilityCodeName(facility_id);
            let subframe_type_name = req.body['subframe_type_select'];
            let final_id = facility_code_name + subframe_type_name + serial_number_text;
            
            res.render("create_subframe/show_subframe_id", {
                serial_number,
                facility_code_name,
                subframe_type_name,
                final_id
            });
        });
    });
});
//#############################################################################
app.get("/finishCreatingSubframeEntry", function(req, res){
    console.log('\nthe user created a subframe...')
    res.redirect("/");
});
//#############################################################################
// view tables and their content in the database
app.get("/viewDataBaseTables", function(req, res){
    console.log('\nthe user attempts to view the tables and their entries...');
    
    let query = "SHOW TABLES";
    connection.query(query, function(error, result){
        if (error)
            throw error;

        baseclass.list_of_tables = result;
        
        query = baseclass.getRecordOfTablesQuery();

        connection.query(query, function(error, result){
            if (error)
                throw error;
                
            let list_of_tables = baseclass.list_of_tables;

            res.render("view_tables_in_db/view_tables", {
                list_of_tables,
                result
            });
        });
    });
});
//#############################################################################
// query the database
app.get("/database_query", function(req, res){
    console.log('\nthe user attempts to query the database...');
    
    query = baseclass.getEnumTablesQuery();

    connection.query(query, function(error, result){
        if (error)
            throw error;

        baseclass.digestEnumValues(result);
        let facility = baseclass.enum_tables_list['Facility_Table'];
        let group = baseclass.enum_tables_list['GroupInformation_Table'];
        let subframe_type = baseclass.enum_tables_list['SubframeType_Table'];
        
        res.render("query_db/query_the_database", {
            facility,
            group,
            subframe_type
        });        
    });        
});
//#############################################################################
// apply the filters to search the database
app.post("/apply_query", function(req, res){
    console.log('\nthe user applied some filters to search the database...');

    let result = baseclass.getSubframeFiltersQuery(req.body);
    let query = result[0];
    let loaded_subframe_filters = result[1];
    
    connection.query(query , function(error, result){
        if (error)
            throw error;

        let Subframe_IDs = baseclass.generateSubframeIDs(result);
        let facility = baseclass.enum_tables_list['Facility_Table'];
        let group = baseclass.enum_tables_list['GroupInformation_Table'];
        let subframe_type = baseclass.enum_tables_list['SubframeType_Table'];

        if (result.length == 0){
            res.render("query_db/query_the_database", {
                facility,
                group,
                subframe_type,
                loaded_subframe_filters,
            });
            return;
        }
        
        res.render("query_db/query_the_database", {
            facility,
            group,
            subframe_type,
            values :
            {
                Subframe_IDs
            },
            loaded_subframe_filters,
        });
    }); 
});
//#############################################################################
// get subframe information
let subframe_id = "";
var all_subframe_information = {};
app.post("/show_subframe_information", function(req, res){
    console.log('\nthe user attempts to get subframe information...')
    
    subframe_id = Object.keys(req.body)[0];
    let facility_name = subframe_id.substring(0,5);
    let subframe_type = subframe_id.substring(5,8);
    let serial_number = Number(subframe_id.substring(8,));
    
    let query = "SELECT * FROM Subframe_Table WHERE " +
                "(SubframeTypeID=(SELECT ID FROM " + 
                "SubframeType_Table WHERE TypeName='" + subframe_type +
                "') AND FacilityID=(SELECT ID FROM Facility_Table WHERE " + 
                "CodeName='" + facility_name + "') AND " +
                "SerialNumber=" + serial_number.toString() + "); ";

    connection.query(query, function(error, subframe_information) {
        if (error)
            throw error;

        if (subframe_information[0]['GroupID'] != null){
            query = "SELECT GroupName FROM GroupInformation_Table WHERE" +
                    " ID=" + subframe_information[0]['GroupID'] + "; ";
        } else {
            query = "";
        }

        query += "SELECT TypeName FROM SubframeType_Table WHERE" +
                 " ID=" +  subframe_information[0]['SubframeTypeID'] + "; ";

        query += "SELECT CodeName FROM Facility_Table WHERE " +
                "ID=" + subframe_information[0]['FacilityID'] + "; ";

        connection.query(query, function(error, result_1){
            if (error)
                throw error;

            if (subframe_information[0]['GroupID'] != null){
                subframe_information[0]['GroupID'] = result_1[0][0]['GroupName'];
                subframe_information[0]['SubframeTypeID'] = result_1[1][0]['TypeName'];
                subframe_information[0]['FacilityID'] = result_1[2][0]['CodeName'];    
            }
            else {
                subframe_information[0]['SubframeTypeID'] = result_1[0][0]['TypeName'];
                subframe_information[0]['FacilityID'] = result_1[1][0]['CodeName'];
            }

            all_subframe_information['subframe'] = subframe_information[0];

            if (all_subframe_information['subframe']['Validity'])
                all_subframe_information['subframe']['Validity'] = 'is valid';
            else
                all_subframe_information['subframe']['Validity'] = 'is not valid!';
        
            query = "SELECT * FROM SubframeEvent_Table WHERE SubframeID=" +
                    subframe_information[0]['ID'] + "; ";

            query += "SELECT * FROM TargetLists_Table WHERE SubframeID=" +
                    subframe_information[0]['ID'] + "; ";

            query += "SELECT * FROM ROI_Table WHERE SubframeID=" +
                    subframe_information[0]['ID'] + "; ";

            query += "SELECT * FROM ROIType_Table; ";

            connection.query(query, function(error, result_2) {
                if (error)
                    throw error;

                all_subframe_information['events'] = result_2[0];
                all_subframe_information['targetplaylists'] = result_2[1];
                all_subframe_information['rois'] = result_2[2];

                if (all_subframe_information['rois'].length > 0){
                    for(let iter=0; iter < all_subframe_information['rois'].length; iter++){
                        for(let idx=0; idx < result_2[3].length; idx++){
                            if (all_subframe_information['rois'][iter]['ROITypeID'] == result_2[3][idx]['ID'])
                                all_subframe_information['rois'][iter]['ROITypeID'] = result_2[3][idx]['Name'];
                        }
                    }
                }

                query = "";
                if (all_subframe_information['events'].length > 0) {
                    for(let idx = 0; idx < all_subframe_information['events'].length; idx++){
                        query += "SELECT * FROM FiducialSet_Table WHERE ID=" +
                                 all_subframe_information['events'][idx]['FiducialSetID'] + "; ";
                        query += "SELECT * FROM DeviceList_Table WHERE ID=" +
                                 all_subframe_information['events'][idx]['DeviceID'] + "; ";
                        query += "SELECT * FROM EventType_Table WHERE ID=" +
                                 all_subframe_information['events'][idx]['EventTypeID'] + "; ";
                    }
                }
                
                if (all_subframe_information['targetplaylists'].length > 0){
                    for(let idx = 0; idx < all_subframe_information['targetplaylists'].length; idx++){
                        query += "SELECT * FROM TargetListItems_Table WHERE TargetListID=" +
                                 all_subframe_information['targetplaylists'][idx]['ID'] + "; ";
                    }
                }
                 
                query += "SELECT * FROM ROIType_Table; ";
                query += "SELECT * FROM DeviceType_Table; ";
                
                connection.query(query, function(error, result_3) {
                    if (error)
                        throw error;

                    query = "";
                    let counter = 0;
                    if (all_subframe_information['events'].length > 0) {
                        for(let idx = 0; idx < all_subframe_information['events'].length; idx++){
                            query += "SELECT * FROM Fiducial_Table WHERE ID=" + 
                                result_3[idx*3][0]['FiducialID1'] + "; ";
                            query += "SELECT * FROM Fiducial_Table WHERE ID=" +
                                 result_3[idx*3][0]['FiducialID2'] + "; ";
                            query += "SELECT * FROM Fiducial_Table WHERE ID=" +
                                 result_3[idx*3][0]['FiducialID3'] + "; ";
                            counter += 3;                            
                        }
                    }

                    query += "SELECT * FROM FiducialPosition_Table; ";

                    query += "SELECT * FROM DeviceList_Table; ";

                    query += "SELECT * FROM EventType_Table; ";

                    if (all_subframe_information['targetplaylists'].length > 0){
                        if (result_3[counter].length > 0){
                            query += "SELECT * FROM Target_Table WHERE ";
                            for(let idx=0; idx < result_3[counter].length; idx++) {
                                if (idx==0)
                                    query += "ID=" + result_3[counter][idx]['TargetID'];
                                else
                                    query += " OR ID=" + result_3[counter][idx]['TargetID'];
                            }
                            query += "; ";
                        }
                    }
                    
                    connection.query(query, function(error, result_4){
                        if (error)
                            throw error;

                        if (all_subframe_information['events'].length > 0) {
                            all_subframe_information['fiducials'] = result_4;
                        }

                        for(let idx=0; idx < result_4[counter].length; idx++){
                            for(let iter=0; iter < counter; iter+=3){
                                if (all_subframe_information['fiducials'][iter][0]['PositionID']==result_4[counter][idx]['ID'])
                                    all_subframe_information['fiducials'][iter][0]['PositionID'] = result_4[counter][idx]['PositionName'];

                                if (all_subframe_information['fiducials'][iter+1][0]['PositionID']==result_4[counter][idx]['ID'])
                                    all_subframe_information['fiducials'][iter+1][0]['PositionID'] = result_4[counter][idx]['PositionName'];

                                if (all_subframe_information['fiducials'][iter+2][0]['PositionID']==result_4[counter][idx]['ID'])
                                    all_subframe_information['fiducials'][iter+2][0]['PositionID'] = result_4[counter][idx]['PositionName'];

                                if (all_subframe_information['fiducials'][iter][0]['Validity'])
                                    all_subframe_information['fiducials'][iter][0]['Validity'] = 'is valid';
                                else
                                    all_subframe_information['fiducials'][iter][0]['Validity'] = 'is not valid!';
                                
                                if (all_subframe_information['fiducials'][iter+1][0]['Validity'])
                                    all_subframe_information['fiducials'][iter+1][0]['Validity'] = 'is valid';
                                else
                                    all_subframe_information['fiducials'][iter+1][0]['Validity'] = 'is not valid!';
        
                                if (all_subframe_information['fiducials'][iter+2][0]['Validity'])
                                    all_subframe_information['fiducials'][iter+2][0]['Validity'] = 'is valid';
                                else
                                    all_subframe_information['fiducials'][iter+2][0]['Validity'] = 'is not valid!';
                            }                            
                        }
                        
                        for(let iter=0; iter < all_subframe_information['events'].length; iter++){
                            for(let idx=0; idx < result_4[counter+1].length; idx++){
                                if (result_4[counter+1][idx]['ID'] == all_subframe_information['events'][iter]['DeviceID']){
                                    all_subframe_information['events'][iter]['DeviceID'] = result_4[counter+1][idx]['VendorName'];
                                }
                            }
                        }

                        for(let iter=0; iter < all_subframe_information['events'].length; iter++){
                            for(let idx=0; idx < result_4[counter+2].length; idx++){
                                if (result_4[counter+2][idx]['ID'] == all_subframe_information['events'][iter]['EventTypeID']){
                                    all_subframe_information['events'][iter]['EventTypeID'] = result_4[counter+2][idx]['EventType'];
                                }
                            }
                        }

                        all_subframe_information['targetplaylists']['targets_in_playlist'] = result_4[counter+3];

                        res.render('query_db/show_subframe_information', {
                            all_subframe_information,
                            subframe_id
                        });
                    });
                });
            });
        });
    });
});
//#############################################################################
// get ROI information
var roi_id = "";
app.post("/show_roi_information", function(req, res){
    console.log('\nthe user attempts to get Region of Interest (ROI) information...')
    
    roi_id = Number(Object.keys(req.body)[0].split('_')[1]);
    let selected_roi = all_subframe_information['rois'][roi_id];
    
    roi_id += 1;

    let query = "SELECT * FROM ROIEvent_Table WHERE ROIID=" +
                selected_roi['ID'] + "; ";
    query += "SELECT * FROM EventType_Table; ";
    query += "SELECT * FROM DeviceList_Table; ";
    query += "SELECT * FROM Sample_Table WHERE ROIID=" +
             selected_roi['ID'] + "; ";
    
    connection.query(query, function(error, result_1){
        if(error)
            throw error;

        if(result_1[0].length > 0){
            for(let idx=0; idx < result_1[0].length; idx++){
                for(let iter=0; iter < result_1[1].length; iter++){
                    if(result_1[0][idx]['EventTypeID'] == result_1[1][iter]['ID'])
                        result_1[0][idx]['EventTypeID'] = result_1[1][iter]['EventType'];
                }
            }

            for(let idx=0; idx < result_1[0].length; idx++){
                for(let iter=0; iter < result_1[2].length; iter++){
                    if(result_1[0][idx]['DeviceID'] == result_1[2][iter]['ID'])
                        result_1[0][idx]['DeviceID'] = result_1[2][iter]['VendorName'];
                }
            }

            all_subframe_information['roi_events'] = result_1[0];
        }

        if(result_1[3].length > 0)
            all_subframe_information['samples'] = result_1[3];

        query = "";
        if(result_1[0].length > 0){
            for(let idx=0; idx < result_1[0].length; idx++){
                query += "SELECT * FROM FiducialSet_Table WHERE ID=" +
                all_subframe_information['roi_events'][idx]['FiducialSetID'] + "; ";
            }
        }

        if(query != ""){
            connection.query(query, function(error, result_2){
                if(error)
                    throw error;

                query = "";
                let counter = 0;
                for(let idx=0; idx < all_subframe_information['roi_events'].length; idx++){
                    if (all_subframe_information['roi_events'].length > 1){
                        query += "SELECT * FROM Fiducial_Table WHERE ID=" +
                            result_2[idx][0]['FiducialID1'] + "; ";
                        query += "SELECT * FROM Fiducial_Table WHERE ID=" +
                            result_2[idx][0]['FiducialID2'] + "; ";
                        query += "SELECT * FROM Fiducial_Table WHERE ID=" +
                            result_2[idx][0]['FiducialID3'] + "; ";
                        counter += 3;
                    } else {
                        query += "SELECT * FROM Fiducial_Table WHERE ID=" +
                            result_2[idx]['FiducialID1'] + "; ";
                        query += "SELECT * FROM Fiducial_Table WHERE ID=" +
                            result_2[idx]['FiducialID2'] + "; ";
                        query += "SELECT * FROM Fiducial_Table WHERE ID=" +
                            result_2[idx]['FiducialID3'] + "; ";
                        counter += 3;
                    }
                }

                query += "SELECT * FROM FiducialPosition_Table; ";
    
                connection.query(query, function(error, result_3){
                    if (error)
                        throw error;
    
                    all_subframe_information['roi_fiducials'] = result_3;
    
                    for(let idx=0; idx < result_3[counter].length; idx++){
                        for(let iter=0; iter < counter; iter+=3){
                            if (all_subframe_information['roi_fiducials'][iter][0]['PositionID']==result_3[counter][idx]['ID'])
                                all_subframe_information['roi_fiducials'][iter][0]['PositionID'] = result_3[counter][idx]['PositionName'];
    
                            if (all_subframe_information['roi_fiducials'][iter+1][0]['PositionID']==result_3[counter][idx]['ID'])
                                all_subframe_information['roi_fiducials'][iter+1][0]['PositionID'] = result_3[counter][idx]['PositionName'];
    
                            if (all_subframe_information['roi_fiducials'][iter+2][0]['PositionID']==result_3[counter][idx]['ID'])
                                all_subframe_information['roi_fiducials'][iter+2][0]['PositionID'] = result_3[counter][idx]['PositionName'];

                            if (all_subframe_information['roi_fiducials'][iter][0]['Validity'])
                                all_subframe_information['roi_fiducials'][iter][0]['Validity'] = 'is valid';
                            else
                                all_subframe_information['roi_fiducials'][iter][0]['Validity'] = 'is not valid!';
                                    
                            if (all_subframe_information['roi_fiducials'][iter+1][0]['Validity'])
                                all_subframe_information['roi_fiducials'][iter+1][0]['Validity'] = 'is valid';
                            else
                                all_subframe_information['roi_fiducials'][iter+1][0]['Validity'] = 'is not valid!';
            
                            if (all_subframe_information['roi_fiducials'][iter+2][0]['Validity'])
                                all_subframe_information['roi_fiducials'][iter+2][0]['Validity'] = 'is valid';
                            else
                                all_subframe_information['roi_fiducials'][iter+2][0]['Validity'] = 'is not valid!';
                        }
                    }
        
                    res.render('query_db/show_roi_information', {
                        selected_roi,
                        subframe_id,
                        roi_id,
                        all_subframe_information
                    });
                });
            });
        } else {
            res.render('query_db/show_roi_information', {
                selected_roi,
                subframe_id,
                roi_id,
                all_subframe_information
            });
        }
    });
});
//#############################################################################
// get sample information
var sample_id = "";
app.post("/show_sample_information", function(req, res){
    console.log('\nthe user attempts to get Sample information...')
    
    sample_id = Number(Object.keys(req.body)[0].split('_')[1]);
    let selected_sample = all_subframe_information['samples'][sample_id];
    
    sample_id += 1;

    let query = "SELECT * FROM SampleEvent_Table WHERE SampleID=" +
                selected_sample['ID'] + "; ";
    query += "SELECT * FROM EventType_Table; ";
    query += "SELECT * FROM DeviceList_Table; ";
    query += "SELECT * FROM Target_Table WHERE SampleID=" +
             selected_sample['ID'] + "; ";

    connection.query(query, function(error, result_1){
        if(error)
            throw error;
        
        if(result_1[0].length > 0){
            for(let idx=0; idx < result_1[0].length; idx++){
                for(let iter=0; iter < result_1[1].length; iter++){
                    if(result_1[0][idx]['EventTypeID'] == result_1[1][iter]['ID'])
                        result_1[0][idx]['EventTypeID'] = result_1[1][iter]['EventType'];
                }
            }

            for(let idx=0; idx < result_1[0].length; idx++){
                for(let iter=0; iter < result_1[2].length; iter++){
                    if(result_1[0][idx]['DeviceID'] == result_1[2][iter]['ID'])
                        result_1[0][idx]['DeviceID'] = result_1[2][iter]['VendorName'];
                }
            }

            all_subframe_information['sample_events'] = result_1[0];
        }

        if (result_1[3].length > 0)
            all_subframe_information['targets'] = result_1[3];
        
        query = "";
        if(result_1[0].length > 0){
            for(let idx=0; idx < result_1[0].length; idx++){
                query += "SELECT * FROM FiducialSet_Table WHERE ID=" +
                all_subframe_information['sample_events'][idx]['FiducialSetID'] + "; ";
            }
        }
    
        if(query != ""){
            connection.query(query, function(error, result_2){
                if(error)
                    throw error;

                query = "";
                let counter = 0;
                for(let idx=0; idx < all_subframe_information['sample_events'].length; idx++){
                    if (all_subframe_information['sample_events'].length > 1){
                        query += "SELECT * FROM Fiducial_Table WHERE ID=" +
                            result_2[idx][0]['FiducialID1'] + "; ";
                        query += "SELECT * FROM Fiducial_Table WHERE ID=" +
                            result_2[idx][0]['FiducialID2'] + "; ";
                        query += "SELECT * FROM Fiducial_Table WHERE ID=" +
                            result_2[idx][0]['FiducialID3'] + "; ";
                        counter += 3;
                    } else {
                        query += "SELECT * FROM Fiducial_Table WHERE ID=" +
                            result_2[idx]['FiducialID1'] + "; ";
                        query += "SELECT * FROM Fiducial_Table WHERE ID=" +
                            result_2[idx]['FiducialID2'] + "; ";
                        query += "SELECT * FROM Fiducial_Table WHERE ID=" +
                            result_2[idx]['FiducialID3'] + "; ";
                        counter += 3;
                    }
                }
    
                query += "SELECT * FROM FiducialPosition_Table; ";
        
                connection.query(query, function(error, result_3){
                    if (error)
                        throw error;
        
                    all_subframe_information['sample_fiducials'] = result_3;
    
                    for(let idx=0; idx < result_3[counter].length; idx++){
                        for(let iter=0; iter < counter; iter+=3){
                            if (all_subframe_information['sample_fiducials'][iter][0]['PositionID']==result_3[counter][idx]['ID'])
                                all_subframe_information['sample_fiducials'][iter][0]['PositionID'] = result_3[counter][idx]['PositionName'];
        
                            if (all_subframe_information['sample_fiducials'][iter+1][0]['PositionID']==result_3[counter][idx]['ID'])
                                all_subframe_information['sample_fiducials'][iter+1][0]['PositionID'] = result_3[counter][idx]['PositionName'];
        
                            if (all_subframe_information['sample_fiducials'][iter+2][0]['PositionID']==result_3[counter][idx]['ID'])
                                all_subframe_information['sample_fiducials'][iter+2][0]['PositionID'] = result_3[counter][idx]['PositionName'];
    
                            if (all_subframe_information['sample_fiducials'][iter][0]['Validity'])
                                all_subframe_information['sample_fiducials'][iter][0]['Validity'] = 'is valid';
                            else
                                all_subframe_information['sample_fiducials'][iter][0]['Validity'] = 'is not valid!';
                                        
                            if (all_subframe_information['sample_fiducials'][iter+1][0]['Validity'])
                                all_subframe_information['sample_fiducials'][iter+1][0]['Validity'] = 'is valid';
                            else
                                all_subframe_information['sample_fiducials'][iter+1][0]['Validity'] = 'is not valid!';
                
                            if (all_subframe_information['sample_fiducials'][iter+2][0]['Validity'])
                                all_subframe_information['sample_fiducials'][iter+2][0]['Validity'] = 'is valid';
                            else
                                all_subframe_information['sample_fiducials'][iter+2][0]['Validity'] = 'is not valid!';
                        }
                    }
        
                    res.render('query_db/show_sample_information', {
                        selected_sample,
                        subframe_id,
                        roi_id,
                        sample_id,
                        all_subframe_information
                    });
                });
            });
        } else {
            res.render('query_db/show_sample_information', {
                selected_sample,
                subframe_id,
                roi_id,
                sample_id,
                all_subframe_information
            });
        }
    });
});
//#############################################################################
// get target information
var target_id = "";
app.post("/show_target_information", function(req, res){
    console.log('\nthe user attempts to get Target information...')
    
    target_id = Number(Object.keys(req.body)[0].split('_')[1]);

    let selected_target = all_subframe_information['targets'][target_id];
    
    target_id += 1;

    let query = "SELECT * FROM TargetEvent_Table WHERE TargetID=" +
                selected_target['ID'] + "; ";
    query += "SELECT * FROM EventType_Table; ";
    query += "SELECT * FROM DeviceList_Table; ";
    
    connection.query(query, function(error, result_1){
        if(error)
            throw error;

        if(result_1[0].length > 0){
            for(let idx=0; idx < result_1[0].length; idx++){
                for(let iter=0; iter < result_1[1].length; iter++){
                    if(result_1[0][idx]['EventTypeID'] == result_1[1][iter]['ID'])
                        result_1[0][idx]['EventTypeID'] = result_1[1][iter]['EventType'];
                }
            }
            
            for(let idx=0; idx < result_1[0].length; idx++){
                for(let iter=0; iter < result_1[2].length; iter++){
                    if(result_1[0][idx]['DeviceID'] == result_1[2][iter]['ID'])
                        result_1[0][idx]['DeviceID'] = result_1[2][iter]['VendorName'];
                }
            }
        }
        
        all_subframe_information['target_events'] = result_1[0];

        query = "";
        if(result_1[0].length > 0){
            for(let idx=0; idx < result_1[0].length; idx++){
                query += "SELECT * FROM FiducialSet_Table WHERE ID=" +
                all_subframe_information['target_events'][idx]['FiducialSetID'] + "; ";
            }
        }
    
        if(query != ""){
            connection.query(query, function(error, result_2){
                if(error)
                    throw error;
                
                query = "";
                let counter = 0;
                for(let idx=0; idx < all_subframe_information['target_events'].length; idx++){
                    if (all_subframe_information['target_events'].length > 1){
                        query += "SELECT * FROM Fiducial_Table WHERE ID=" +
                            result_2[idx][0]['FiducialID1'] + "; ";
                        query += "SELECT * FROM Fiducial_Table WHERE ID=" +
                            result_2[idx][0]['FiducialID2'] + "; ";
                        query += "SELECT * FROM Fiducial_Table WHERE ID=" +
                            result_2[idx][0]['FiducialID3'] + "; ";
                        counter += 3;
                    } else {
                        query += "SELECT * FROM Fiducial_Table WHERE ID=" +
                            result_2[idx]['FiducialID1'] + "; ";
                        query += "SELECT * FROM Fiducial_Table WHERE ID=" +
                            result_2[idx]['FiducialID2'] + "; ";
                        query += "SELECT * FROM Fiducial_Table WHERE ID=" +
                            result_2[idx]['FiducialID3'] + "; ";
                        counter += 3;
                    }
                }
                    
                query += "SELECT * FROM FiducialPosition_Table; ";
        
                connection.query(query, function(error, result_3){
                    if (error)
                        throw error;
        
                    all_subframe_information['target_fiducials'] = result_3;
        
                    for(let idx=0; idx < result_3[counter].length; idx++){
                        for(let iter=0; iter < counter; iter+=3){
                            if (all_subframe_information['target_fiducials'][iter][0]['PositionID']==result_3[counter][idx]['ID'])
                                all_subframe_information['target_fiducials'][iter][0]['PositionID'] = result_3[counter][idx]['PositionName'];
        
                            if (all_subframe_information['target_fiducials'][iter+1][0]['PositionID']==result_3[counter][idx]['ID'])
                                all_subframe_information['target_fiducials'][iter+1][0]['PositionID'] = result_3[counter][idx]['PositionName'];
        
                            if (all_subframe_information['target_fiducials'][iter+2][0]['PositionID']==result_3[counter][idx]['ID'])
                                all_subframe_information['target_fiducials'][iter+2][0]['PositionID'] = result_3[counter][idx]['PositionName'];
    
                            if (all_subframe_information['target_fiducials'][iter][0]['Validity'])
                                all_subframe_information['target_fiducials'][iter][0]['Validity'] = 'is valid';
                            else
                                all_subframe_information['target_fiducials'][iter][0]['Validity'] = 'is not valid!';
                                        
                            if (all_subframe_information['target_fiducials'][iter+1][0]['Validity'])
                                all_subframe_information['target_fiducials'][iter+1][0]['Validity'] = 'is valid';
                            else
                                all_subframe_information['target_fiducials'][iter+1][0]['Validity'] = 'is not valid!';
                
                            if (all_subframe_information['target_fiducials'][iter+2][0]['Validity'])
                                all_subframe_information['target_fiducials'][iter+2][0]['Validity'] = 'is valid';
                            else
                                all_subframe_information['target_fiducials'][iter+2][0]['Validity'] = 'is not valid!';
                        }
                    }
                         
                    res.render('query_db/show_target_information', {
                        selected_target,
                        subframe_id,
                        roi_id,
                        sample_id,
                        target_id,
                        all_subframe_information
                    });
                });
            });
        } else {
            res.render('query_db/show_target_information', {
                selected_target,
                subframe_id,
                roi_id,
                sample_id,
                target_id,
                all_subframe_information
            });
        }
    });
});
//#############################################################################
// get subframe ids
app.post("/get_subframe_ids", function(req, res){
    console.log('\nthe user attempts to know the Subframe IDs...');
    let q = "SELECT * FROM Subframe_Table";

    let subframe_information = [];
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
            if (error)
                throw error;
            
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
                subframe_information
            });
        });
    });
});

// GET call
app.get("/submitDataManually", function(req, res){
    console.log('\nthe user attempts to submit the data manually...');

    Subframe_IDs = [];
    
    let query = "SELECT ID, SubframeTypeID, FacilityID, SerialNumber" +
                " FROM Subframe_Table; ";
    query += "SELECT * FROM SubframeType_Table; ";
    query += "SELECT * FROM Facility_Table; ";

    connection.query(query, function(error, result){
        if (error)
            throw error;

        let subframe_id = "";
        for(let idx=0; idx < result[0].length; idx++){
            subframe_id = "";

            for(let iter=0; iter < result[2].length; iter++){
                if(result[0][idx]['FacilityID']==result[2][iter]['ID']){
                    subframe_id += result[2][iter]['CodeName'];
                    break;
                }
            }

            for(let iter=0; iter < result[1].length; iter++){
                if(result[0][idx]['SubframeTypeID']==result[1][iter]['ID']){
                    subframe_id += result[1][iter]['TypeName'];
                    break;
                }
            }

            let padd_length = 6-result[0][idx]['SerialNumber'].toString().length;
            serial_number_str = result[0][idx]['SerialNumber'].toString();
            for (let j=0; j < padd_length; j++){
                serial_number_str = "0" + serial_number_str;
            }

            subframe_id += serial_number_str;
            Subframe_IDs.push([result[0][idx]['ID'], subframe_id]);
        }

        res.render("manual_insertion/home_manual_data_insertion", {
            Subframe_IDs
        });
    });
});


//#############################################################################
// submit event information related to the subframe
var fiducial_positions = {};
var device_lists = {};
var event_types = {};
app.post("/createSubframeEvent", function(req, res){
    console.log('\nthe user attempts to insert the Subframe event...');

    if (req.body['create_event_for_subframe'] == 0){
        insert_subframe_information.push({
            key: 'subframe_info',
            value: req.body
        });
    }
    else if (req.body['create_event_for_subframe'] == 1){
        insert_subframe_information.push({
            key: 'subframe_event',
            value: req.body
        });
    }

    let query = "SELECT * FROM SubframeEvent_Table ORDER BY id DESC LIMIT 1; ";
    query += "SELECT * FROM Fiducial_Table ORDER BY id DESC LIMIT 1; ";

    if (req.body['create_event_for_subframe'] == 0){
        query += "SELECT * FROM DeviceList_Table; ";
        query += "SELECT * FROM EventType_Table; ";
        query += "SELECT * FROM FiducialPosition_Table; ";
    }

    connection.query(query, function(error, result){
        if (error)
            throw error;

        if (req.body['create_event_for_subframe'] == 0){
            device_lists = result[2];
            event_types = result[3];
            fiducial_positions = result[4];
        }

        let subframe_event = result[0];
        let fiducials = result[1];

        res.render("manual_insertion/manual_subframe_event", {
            insert_subframe_information,
            subframe_event,
            fiducials,
            device_lists,
            event_types,
            fiducial_positions
        });
    });
});

//#############################################################################
// submit ROI information
var roi_types = {};
app.post("/createSubframeROI", function(req, res){
    console.log('\nthe user attempts to create a ROI on the Subframe...');

    if (req.body['create_roi_for_subframe'] == 0){
        insert_subframe_information.push({
            key: 'subframe_info',
            value: req.body
        });
    } else if (req.body['create_roi_for_subframe'] == 1){
        insert_subframe_information.push({
            key: 'subframe_event',
            value: req.body
        });
    } else if (req.body['create_roi_for_subframe'] == 2){
        insert_subframe_information.push({
            key: 'roi_info',
            value: req.body
        });
    } else if (req.body['create_roi_for_subframe'] == 3){
        insert_subframe_information.push({
            key: 'roi_event',
            value: req.body
        });
    }

    let query = "SELECT * FROM ROIType_Table; ";

    connection.query(query, function(error, result){
        if (error)
            throw error;

        roi_types = result;

        res.render("manual_insertion/home_manually_roi", {
            insert_subframe_information,
            roi_types
        });
    });
});

//#############################################################################
// submit event related to the ROI
app.post("/createROIEvent", function(req, res){
    console.log('\nthe user attempts to create an event for the ROI');

    if (req.body['create_event_for_roi'] == 0){
        insert_subframe_information.push({
            key: 'roi_info',
            value: req.body
        });
    }
    else if (req.body['create_event_for_roi'] == 1){
        insert_subframe_information.push({
            key: 'roi_event',
            value: req.body
        });
    }

    let query = "SELECT * FROM ROIEvent_Table ORDER BY id DESC LIMIT 1; ";
    query += "SELECT * FROM Fiducial_Table ORDER BY id DESC LIMIT 1; ";

    if (req.body['create_event_for_roi'] == 0){
        query += "SELECT * FROM DeviceList_Table; ";
        query += "SELECT * FROM EventType_Table; ";
        query += "SELECT * FROM FiducialPosition_Table; ";
    }

    connection.query(query, function(error, result){
        if (error)
            throw error;

        if (req.body['create_event_for_roi'] == 0){
            device_lists = result[2];
            event_types = result[3];
            fiducial_positions = result[4];
        }

        let roi_event = result[0];
        let fiducials = result[1]; 

        res.render("manual_insertion/manual_roi_event", {
            insert_subframe_information,
            roi_event,
            fiducials,
            device_lists,
            event_types,
            fiducial_positions
        });
    });
});

//#############################################################################
// submit sample information
app.post("/createSubframeSample", function(req, res){
    console.log('\nthe user attempts to create a Sample on the Subframe...');
    
    if (req.body['create_sample_for_subframe'] == 0){
        insert_subframe_information.push({
            key: 'roi_info',
            value: req.body
        });
    } else if (req.body['create_sample_for_subframe'] == 1){
        insert_subframe_information.push({
            key: 'roi_event',
            value: req.body
        });
    } else if (req.body['create_sample_for_subframe'] == 2){
        insert_subframe_information.push({
            key: 'sample_info',
            value: req.body
        });
    } else if (req.body['create_sample_for_subframe'] == 3){
        insert_subframe_information.push({
            key: 'sample_event',
            value: req.body
        });
    }
    
    res.render("manual_insertion/home_manually_sample", {
        insert_subframe_information
    });
});

//#############################################################################
// submit event related to the sample
app.post("/createSampleEvent", function(req, res){
    console.log('\nthe user attempts to create an event for the Sample');

    if (req.body['create_event_for_sample'] == 0){
        insert_subframe_information.push({
            key: 'sample_info',
            value: req.body
        });
    }
    else if (req.body['create_event_for_sample'] == 1){
        insert_subframe_information.push({
            key: 'sample_event',
            value: req.body
        });
    }

    let query = "SELECT * FROM SampleEvent_Table ORDER BY id DESC LIMIT 1; ";
    query += "SELECT * FROM Fiducial_Table ORDER BY id DESC LIMIT 1; ";

    if (req.body['create_event_for_sample'] == 0){
        query += "SELECT * FROM DeviceList_Table; ";
        query += "SELECT * FROM EventType_Table; ";
        query += "SELECT * FROM FiducialPosition_Table; ";
    }

    connection.query(query, function(error, result){
        if (error)
            throw error;

        if (req.body['create_event_for_sample'] == 0){
            device_lists = result[2];
            event_types = result[3];
            fiducial_positions = result[4];
        }

        let sample_event = result[0];
        let fiducials = result[1]; 

        res.render("manual_insertion/manual_sample_event", {
            insert_subframe_information,
            sample_event,
            fiducials,
            device_lists,
            event_types,
            fiducial_positions
        });
    });
});

//#############################################################################
// submit target information
app.post("/createSubframeTarget", function(req, res){
    console.log('\nthe user attempts to create a Target on the Subframe...');

    if (req.body['create_sample_for_subframe'] == 0){
        insert_subframe_information.push({
            key: 'sample_info',
            value: req.body
        });
    } else if (req.body['create_sample_for_subframe'] == 1){
        insert_subframe_information.push({
            key: 'sample_event',
            value: req.body
        });
    } else if (req.body['create_sample_for_subframe'] == 2){
        insert_subframe_information.push({
            key: 'target_info',
            value: req.body
        });
    } else if (req.body['create_target_for_subframe'] == 3){
        insert_subframe_information.push({
            key: 'target_event',
            value: req.body
        });
    }
    
    res.render("manual_insertion/home_manually_target", {
        insert_subframe_information
    });
});

//#############################################################################
// submit event related to the target
app.post("/createTargetEvent", function(req, res){
    console.log('\nthe user attempts to create an event for the Target');

    if (req.body['create_event_for_target'] == 0){
        insert_subframe_information.push({
            key: 'target_info',
            value: req.body
        });
    }
    else if (req.body['create_event_for_target'] == 1){
        insert_subframe_information.push({
            key: 'target_event',
            value: req.body
        });
    }

    let query = "SELECT * FROM TargetEvent_Table ORDER BY id DESC LIMIT 1; ";
    query += "SELECT * FROM Fiducial_Table ORDER BY id DESC LIMIT 1; ";

    if (req.body['create_event_for_target'] == 0){
        query += "SELECT * FROM DeviceList_Table; ";
        query += "SELECT * FROM EventType_Table; ";
        query += "SELECT * FROM FiducialPosition_Table; ";
    }

    connection.query(query, function(error, result){
        if (error)
            throw error;

        if (req.body['create_event_for_target'] == 0){
            device_lists = result[2];
            event_types = result[3];
            fiducial_positions = result[4];
        }

        let target_event = result[0];
        let fiducials = result[1]; 

        res.render("manual_insertion/manual_target_event", {
            insert_subframe_information,
            target_event,
            fiducials,
            device_lists,
            event_types,
            fiducial_positions
        });
    });
});
//#############################################################################
// submit the data to the database and return to the main page
app.post("/submitAndReturnToMain", function(req, res){
    console.log('\nthe user attempts to submit all the data to the database...');

    let query = '';
    if (req.body['submit_the_data_to_db']==0){
        console.log('only the subframe information is inserted...');

        query = functions.createSubframeQuery(req.body,
                                              insert_subframe_information[1]['value'],
                                              group_information,
                                              subframe_types,
                                              facilities); 
    }

                              
                              

                              
    

    


});


//#############################################################################
// create target(s) playlist
app.post("/createTargetPlaylist", function(req, res){
    console.log('\nthe user attempts to create target(s) playlist');

    

});









































// app.post("/submitDataManually", function(req, res){
//    res.render("manual_insertion/home_manually_subframe_fiducials");
// });
//#############################################################################
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
            res.render("manual_insertion/home_manually_subframe_fiducials");
    } else { 
        res.render("manual_insertion/home_manually_subframe");
    }  
});
//#############################################################################
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
//#############################################################################
app.post("/addToTable", function(req, res){
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
//#############################################################################
app.post("/removeFromTable", function(req, res){
    var table_name = req.body.listName;
    var row_id = req.body.remove_row;

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
//#############################################################################
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
            res.render("manual_insertion/home_manually_subframe");
    } else { 
        res.render("manual_insertion/manually_roi_fiducials");
    }    
});
//#############################################################################
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
            res.render("manual_insertion/manually_roi_fiducials");
    } else { 
        res.render("manual_insertion/manually_roi_image");
    }  
});
//#############################################################################
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
        res.render("manual_insertion/manually_roi_image");
    } else { 
        res.render("manual_insertion/manually_sample_fiducials");
    }
});
//#############################################################################
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
        res.render("manual_insertion/manually_sample_fiducials");
    } else {
        res.render("manual_insertion/manually_sample_image");
    }
});
//#############################################################################
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
            res.render("manual_insertion/manually_sample_image");
    } else {
        res.render("manual_insertion/manually_target_fiducials");
    }
});
//#############################################################################
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
        res.render("manual_insertion/manually_target_fiducials");
    } else {
        res.render("manual_insertion/manually_target_data");
    }    
});
//#############################################################################
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
        res.render("manual_insertion/manually_target_data");
    } else {

        var db_query = [];
        
        if (!variables.subframe_data_itemNamesData.subframe_validity) {
            db_query = "UPDATE Subframe_Table SET Validity=0, InvalidSinceTimeStamp='" +  variables.subframe_data_itemNamesData.subframe_invalid_date + 
            " " + variables.subframe_data_itemNamesData.subframe_invalid_time + ":00' WHERE SubframeTypeID=(SELECT ID FROM SubframeType_Table WHERE TypeName='" + 
            variables.subframe_data_itemNamesData.subframe_type + "') AND FacilityID=(SELECT ID FROM Facility_Table WHERE CodeName='" +
            variables.subframe_data_itemNamesData.facility_name + "') AND SerialNumber=" + variables.subframe_data_itemNamesData.serial_number + ";";      
            
            connection.query(db_query, function (error, result) {
                if (error) throw error;
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
            
            connection.query(target_event_query, function (error, result) {
                if (error) throw error;
                console.log("Finished");            
                res.redirect("/");
            });
        }
    }
});
//#############################################################################
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

    var db_query = [];
        
        if (!variables.subframe_data_itemNamesData.subframe_validity) {
            db_query = "UPDATE Subframe_Table SET Validity=0, InvalidSinceTimeStamp='" +  variables.subframe_data_itemNamesData.subframe_invalid_date + 
            " " + variables.subframe_data_itemNamesData.subframe_invalid_time + ":00' WHERE SubframeTypeID=(SELECT ID FROM SubframeType_Table WHERE TypeName='" + 
            variables.subframe_data_itemNamesData.subframe_type + "') AND FacilityID=(SELECT ID FROM Facility_Table WHERE CodeName='" +
            variables.subframe_data_itemNamesData.facility_name + "') AND SerialNumber=" + variables.subframe_data_itemNamesData.serial_number + ";";      
            
            connection.query(db_query, function (error, result) {
                if (error) throw error;
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
                if (error)
                    throw error;
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
                if (error)
                    throw error;
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
                if (error)
                    throw error;
            });

            console.log("inserting the target related information to the database");
            var target_query = "INSERT INTO Target_Table (SampleID, X, Y, Z, Comments, CreateTimeStamp) VALUES (" + 
            "(SELECT ID FROM Sample_Table ORDER BY DBInsertTimeStamp DESC LIMIT 1), " +
            + variables.target_data_itemNamesData.target_x_position + ", " + variables.target_data_itemNamesData.target_y_position + ", " +
            variables.target_data_itemNamesData.target_z_position + ", '" + variables.target_data_itemNamesData.target_comments + "', '" + 
            variables.target_data_itemNamesData.targetinfo_experiment_date + " " + variables.target_data_itemNamesData.targetinfo_experiment_time + ":00'" + ");";

            connection.query(target_query, function (error, result) {
                if (error)
                    throw error;
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
            
            connection.query(target_event_query, function (error, result) {
                if (error) throw error;
                console.log("Finished");            
                res.redirect("/");
            });
        }
});
//#############################################################################
app.post("/submitXMLFile", function(req, res){
    fs.readFile(req.body.xmlFile, function(err, data){
        xmlParser.parseString(data, function(xml_err, result){
            if(xml_err)
                console.log(xml_err);
            res.render("home_xml_data", {xml_data: result['experiment']['subframe'][0]});  
        });
    });
});
//#############################################################################
app.post("/submitExperimentXML", function(req, res){
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
        res.redirect("/");
    });
});
//#############################################################################
app.listen(8080, function () {
 console.log('App listening on port 8080!');
});
//#############################################################################
