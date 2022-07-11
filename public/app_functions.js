function checkEmpty(term, page_name) {
    var result = false;

    if (page_name === "subframe_data"){
        value_0 = (term.subframe_validity===true ? true:false);
        if (value_0) {
            value_1 = (term.facility_name==='' ? true:false);
            value_2 = (term.subframe_type==='' ? true:false);
            value_3 = (term.serial_number===0 ? true:false);
            value_4 = (term.group_name==="Choose..." ? true:false);
            value_5 = (term.subframe_experiment_date==='' ? true:false);
            value_6 = (term.subframe_experiment_time==='' ? true:false);
            value_8 = (term.subframe_device_select==="Choose..." ? true:false);
            value_9 = (term.subframe_event_select==="Choose..." ? true:false);
            value_10 = (term.subframe_link_to_data==='' ? true:false);
            value_11 = (term.subframe_link_to_meta_data==='' ? true:false);
            value_12 = (term.subframe_event_experiment_date==='' ? true:false);
            value_13 = (term.subframe_event_experiment_time==='' ? true:false);
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

            result = (value_1 | value_2 | value_3 | value_4 | value_5 | value_6 | value_8 | 
                value_9 | value_10 | value_11 | value_12 | value_13 | value_15 | value_16 | value_17 |
                value_18 | value_19 | value_20 | value_21 | value_22 | value_23 | value_24 | value_25 | value_26 |
                value_27 | value_28 | value_29 | value_30 | value_31 | value_32 | value_33 | value_34 | value_35);        
        } else {
            value_1 = (term.subframe_invalid_date==='' ? true:false);
            value_2 = (term.subframe_invalid_time==='' ? true:false);
            
            result = (value_1 | value_2);
        }
    } else if (page_name === "subframe_fids") {
        value_0 = (term.subframe_fid1_validity===false ? true:false);
        value_1 = (term.subframe_fid1_position_name==="Choose..." ? true:false);
        value_2 = (term.subframe_fid1_x_position==='' ? true:false);
        value_3 = (term.subframe_fid1_y_position==='' ? true:false);
        value_4 = (term.subframe_fid1_z_position==='' ? true:false);
        value_5 = (term.subframe_fid1_experiment_date==='' ? true:false);
        value_6 = (term.subframe_fid1_experiment_time==='' ? true:false);
        value_7 = (term.subframe_fid2_validity===false ? true:false);
        value_8 = (term.subframe_fid2_position_name==="Choose..." ? true:false);
        value_9 = (term.subframe_fid2_x_position==='' ? true:false);
        value_10 = (term.subframe_fid2_y_position==='' ? true:false);
        value_11 = (term.subframe_fid2_z_position==='' ? true:false);
        value_12 = (term.subframe_fid2_experiment_date==='' ? true:false);
        value_13 = (term.subframe_fid2_experiment_time==='' ? true:false);
        value_14 = (term.subframe_fid3_validity===false ? true:false);
        value_15 = (term.subframe_fid3_position_name==="Choose..." ? true:false);
        value_16 = (term.subframe_fid3_x_position==='' ? true:false);
        value_17 = (term.subframe_fid3_y_position==='' ? true:false);
        value_18 = (term.subframe_fid3_z_position==='' ? true:false);
        value_19 = (term.subframe_fid3_experiment_date==='' ? true:false);
        value_20 = (term.subframe_fid3_experiment_time==='' ? true:false);

        result = (value_0 | value_1 | value_2 | value_3 | value_4 | value_5 | value_6 | value_7 | value_8 | 
            value_10 | value_11 | value_12 | value_13 | value_14 | value_15 | value_17 | value_18 | value_19 | value_20);
    
    } else if (page_name === "roi_fids") {
        value_0 = (term.roi_event_fid1_validity===false ? true:false);
        value_1 = (term.roi_event_fid1_position_name==="Choose..." ? true:false);
        value_2 = (term.roi_event_fid1_x_position==='' ? true:false);
        value_3 = (term.roi_event_fid1_y_position==='' ? true:false);
        value_4 = (term.roi_event_fid1_z_position==='' ? true:false);
        value_5 = (term.roi_event_fid1_date==='' ? true:false);
        value_6 = (term.roi_event_fid1_time==='' ? true:false);
        value_7 = (term.roi_event_fid2_validity===false ? true:false);
        value_8 = (term.roi_event_fid2_position_name==="Choose..." ? true:false);
        value_9 = (term.roi_event_fid2_x_position==='' ? true:false);
        value_10 = (term.roi_event_fid2_y_position==='' ? true:false);
        value_11 = (term.roi_event_fid2_z_position==='' ? true:false);
        value_12 = (term.roi_event_fid2_date==='' ? true:false);
        value_13 = (term.roi_event_fid1_time==='' ? true:false);
        value_14 = (term.roi_event_fid3_validity===false ? true:false);
        value_15 = (term.roi_event_fid3_position_name==="Choose..." ? true:false);
        value_16 = (term.roi_event_fid3_x_position==='' ? true:false);
        value_17 = (term.roi_event_fid3_y_position==='' ? true:false);
        value_18 = (term.roi_event_fid3_z_position==='' ? true:false);
        value_19 = (term.roi_event_fid3_date==='' ? true:false);
        value_20 = (term.roi_event_fid3_time==='' ? true:false);

        result = (value_0 | value_1 | value_2 | value_3 | value_4 | value_5 | value_6 | value_7 | value_8 | 
            value_10 | value_11 | value_12 | value_13 | value_14 | value_15 | value_17 | value_18 | value_19 | value_20);

    } else if (page_name === "roi_data") {
        value_0 = (term.roi_type==="Choose..." ? true:false);
        value_1 = (term.roi_detection_method==="Choose..." ? true:false);
        value_2 = (term.roi_experiment_x_position==='' ? true:false);
        value_3 = (term.roi_experiment_y_position==='' ? true:false);
        value_4 = (term.roi_experiment_width==='' ? true:false);
        value_5 = (term.roi_experiment_height==='' ? true:false);
        value_6 = (term.roi_mask_load==='' ? true:false);
        value_7 = (term.roi_experiment_date==='' ? true:false);
        value_8 = (term.roi_experiment_time==='' ? true:false);
        value_10 = (term.roi_device==="Choose..." ? true:false);
        value_11 = (term.roi_event_type==="Choose..." ? true:false);
        value_12 = (term.roi_event_link_to_data==='' ? true:false);
        value_13 = (term.roi_event_link_to_meta_data==='' ? true:false);
        value_14 = (term.roi_event_date==='' ? true:false);
        value_15 = (term.roi_event_time==='' ? true:false);
        
        result = (value_0 | value_1 | value_2 | value_3 | value_4 | value_5 | value_6 | value_7 | value_8 | 
            value_10 | value_11 | value_12 | value_13 | value_14 | value_15);

    } else if (page_name==="sampleimage_fids"){
        value_0 = (term.sample_event_fid1_validity===false ? true:false);
        value_1 = (term.sample_event_fid1_position_name==="Choose..." ? true:false);
        value_2 = (term.sample_event_fid1_x_position==='' ? true:false);
        value_3 = (term.sample_event_fid1_y_position==='' ? true:false);
        value_4 = (term.sample_event_fid1_z_position==='' ? true:false);
        value_5 = (term.sample_event_fid1_experiment_date==='' ? true:false);
        value_6 = (term.sample_event_fid1_experiment_time==='' ? true:false);
        value_7 = (term.sample_event_fid2_validity===false ? true:false);
        value_8 = (term.sample_event_fid2_position_name==="Choose..." ? true:false);
        value_9 = (term.sample_event_fid2_x_position==='' ? true:false);
        value_10 = (term.sample_event_fid2_y_position==='' ? true:false);
        value_11 = (term.sample_event_fid2_z_position==='' ? true:false);
        value_12 = (term.sample_event_fid2_experiment_date==='' ? true:false);
        value_13 = (term.sample_event_fid1_experiment_time==='' ? true:false);
        value_14 = (term.sample_event_fid3_validity===false ? true:false);
        value_15 = (term.sample_event_fid3_position_name==="Choose..." ? true:false);
        value_16 = (term.sample_event_fid3_x_position==='' ? true:false);
        value_17 = (term.sample_event_fid3_y_position==='' ? true:false);
        value_18 = (term.sample_event_fid3_z_position==='' ? true:false);
        value_19 = (term.sample_event_fid3_experiment_date==='' ? true:false);
        value_20 = (term.sample_event_fid3_experiment_time==='' ? true:false);

        result = (value_0 | value_1 | value_2 | value_3 | value_4 | value_5 | value_6 | value_7 | value_9 |
            value_10 | value_11 | value_12 | value_13 | value_14 | value_16 | value_17 | value_18 | value_19 | value_20);

    } else if (page_name==="sampleimage_data"){
        value_0 = (term.sample_experiment_x_position==='' ? true:false);
        value_1 = (term.sample_experiment_y_position==='' ? true:false);
        value_2 = (term.sample_experiment_width==='' ? true:false);
        value_3 = (term.sample_experiment_height==='' ? true:false);
        value_4 = (term.sample_detection_method==="Choose..." ? true:false);
        value_5 = (term.sample_mask_load==='' ? true:false);
        value_6 = (term.sample_experiment_date==='' ? true:false);
        value_7 = (term.sample_experiment_time==='' ? true:false);
        value_9 = (term.sample_device==="Choose..." ? true:false);
        value_10 = (term.sample_event_type==="Choose..." ? true:false);
        value_11 = (term.sample_event_link_to_data==='' ? true:false);
        value_12 = (term.sample_event_link_to_meta_data==='' ? true:false);
        value_13 = (term.sample_event_date==='' ? true:false);
        value_14 = (term.sample_event_time==='' ? true:false);

        result = (value_0 | value_1 | value_2 | value_3 | value_4 | value_5 | value_6 | value_7 | value_9 |
            value_10 | value_11 | value_12 | value_13 | value_14);

    } else if (page_name==="target_fids") {
        value_0 = (term.target_event_fid1_validity===false ? true:false);
        value_1 = (term.target_event_fid1_position_name==="Choose..." ? true:false);
        value_2 = (term.target_event_fid1_x_position==='' ? true:false);
        value_3 = (term.target_event_fid1_y_position==='' ? true:false);
        value_4 = (term.target_event_fid1_z_position==='' ? true:false);
        value_5 = (term.target_event_fid1_experiment_date==='' ? true:false);
        value_6 = (term.target_event_fid1_experiment_time==='' ? true:false);
        value_7 = (term.target_event_fid2_validity===false ? true:false);
        value_8 = (term.target_event_fid2_position_name==="Choose..." ? true:false);
        value_9 = (term.target_event_fid2_x_position==='' ? true:false);
        value_10 = (term.target_event_fid2_y_position==='' ? true:false);
        value_11 = (term.target_event_fid2_z_position==='' ? true:false);
        value_12 = (term.target_event_fid2_experiment_date==='' ? true:false);
        value_13 = (term.target_event_fid1_experiment_time==='' ? true:false);
        value_14 = (term.target_event_fid3_validity===false ? true:false);
        value_15 = (term.target_event_fid3_position_name==="Choose..." ? true:false);
        value_16 = (term.target_event_fid3_x_position==='' ? true:false);
        value_17 = (term.target_event_fid3_y_position==='' ? true:false);
        value_18 = (term.target_event_fid3_z_position==='' ? true:false);
        value_19 = (term.target_event_fid3_experiment_date==='' ? true:false);
        value_20 = (term.target_event_fid3_experiment_time==='' ? true:false);

        result = (value_0 | value_1 | value_2 | value_3 | value_4 | value_6 | value_7 | value_8 | value_9 |
            value_10 | value_11 | value_13 | value_14 | value_15 | value_16 | value_17 | value_18 | value_19 | value_20);

    } else if (page_name==="target_data") {
        value_0 = (term.target_x_position==='' ? true:false);
        value_1 = (term.target_y_position==='' ? true:false);
        value_2 = (term.target_z_position==='' ? true:false);
        value_3 = (term.targetinfo_experiment_date==='' ? true:false);
        value_4 = (term.targetinfo_experiment_time==='' ? true:false);
        value_6 = (term.target_device==="Choose..." ? true:false);
        value_7 = (term.target_event_type==="Choose..." ? true:false);
        value_8 = (term.target_link_to_data==='' ? true:false);
        value_9 = (term.target_link_to_meta_data==='' ? true:false);
        value_10 = (term.target_event_experiment_date==='' ? true:false);
        value_11 = (term.target_event_experiment_time==='' ? true:false);

        result = (value_0 | value_1 | value_2 | value_3 | value_4 | value_6 | value_7 | value_8 | value_9 |
            value_10 | value_11);

    } else if (page_name==="xmldata") {
        result = true;
    }

    return result;
}

module.exports = {
    checkEmpty
}