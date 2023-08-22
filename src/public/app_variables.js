// app_variables.js

















module.exports = {
    
}



/*

var subframe_fiducials_itemNamesData = {
    subframe_fid1_validity: '', 
    subframe_fid1_position_name: '', 
    subframe_fid1_x_position: '', 
    subframe_fid1_y_position: '', 
    subframe_fid1_z_position: '', 
    subframe_fid1_date: '', 
    subframe_fid1_time: '', 
    subframe_fid2_validity: '', 
    subframe_fid2_position_name: '', 
    subframe_fid2_x_position: '', 
    subframe_fid2_y_position: '', 
    subframe_fid2_z_position: '', 
    subframe_fid2_date: '', 
    subframe_fid2_time: '', 
    subframe_fid3_validity: '', 
    subframe_fid3_position_name: '', 
    subframe_fid3_x_position: '', 
    subframe_fid3_y_position: '', 
    subframe_fid3_z_position: '', 
    subframe_fid3_date: '', 
    subframe_fid3_time: ''
};

var subframe_data_itemNamesData = {
    facility_name: '', 
    subframe_type: '', 
    serial_number: '', 
    group_name: '', 
    subframe_experiment_date: '',
    subframe_experiment_time: '', 
    subframe_comments: '', 
    subframe_validity: '', 
    subframe_invalid_date: '', 
    subframe_invalid_time: '', 
    subframe_device_select: '', 
    subframe_event_select: '', 
    subframe_link_to_data: '', 
    subframe_link_to_meta_data: '', 
    subframe_event_experiment_date: '', 
    subframe_event_experiment_time: '', 
    subframe_events_comments: ''
};

var roi_fiducials_itemNamesData = {
    roi_event_fid1_validity: '', 
    roi_event_fid1_position_name: '', 
    roi_event_fid1_x_position: '', 
    roi_event_fid1_y_position: '', 
    roi_event_fid1_z_position: '', 
    roi_event_fid1_experiment_date: '', 
    roi_event_fid1_experiment_time: '', 
    roi_event_fid2_validity: '', 
    roi_event_fid2_position_name: '', 
    roi_event_fid2_x_position: '', 
    roi_event_fid2_y_position: '', 
    roi_event_fid2_z_position: '', 
    roi_event_fid2_experiment_date: '', 
    roi_event_fid2_experiment_time: '', 
    roi_event_fid3_validity: '', 
    roi_event_fid3_position_name: '', 
    roi_event_fid3_x_position: '', 
    roi_event_fid3_y_position: '', 
    roi_event_fid3_z_position: '', 
    roi_event_fid3_experiment_date: '', 
    roi_event_fid3_experiment_time: ''
};

var roi_data_itemNamesData = {
    roi_type: '', 
    roi_detection_method: '', 
    roi_experiment_x_position: '',
    roi_experiment_y_position: '', 
    roi_experiment_width: '', 
    roi_experiment_height: '', 
    roi_mask_load: '', 
    roi_experiment_date: '', 
    roi_experiment_time: '', 
    roi_experiment_comments: '', 
    roi_device: '', 
    roi_event_type: '', 
    roi_event_link_to_data: '', 
    roi_event_link_to_meta_data: '', 
    roi_event_date: '', 
    roi_event_time: '', 
    roi_event_comments: ''
};

var sample_fiducials_itemNamesData = {
    sample_event_fid1_validity: '', 
    sample_event_fid1_position_name: '', 
    sample_event_fid1_x_position: '', 
    sample_event_fid1_y_position: '', 
    sample_event_fid1_z_position: '', 
    sample_event_fid1_experiment_date: '', 
    sample_event_fid1_experiment_time: '', 
    sample_event_fid2_validity: '', 
    sample_event_fid2_position_name: '', 
    sample_event_fid2_x_position: '', 
    sample_event_fid2_y_position: '', 
    sample_event_fid2_z_position: '', 
    sample_event_fid2_experiment_date: '', 
    sample_event_fid2_experiment_time: '',
    sample_event_fid3_validity: '', 
    sample_event_fid3_position_name: '', 
    sample_event_fid3_x_position: '', 
    sample_event_fid3_y_position: '', 
    sample_event_fid3_z_position: '', 
    sample_event_fid3_experiment_date: '', 
    sample_event_fid3_experiment_time: ''
};

var sample_data_itemNamesData = {
    sample_experiment_x_position: '', 
    sample_experiment_y_position: '', 
    sample_experiment_width: '', 
    sample_experiment_height: '',
    sample_experiment_theta: '',
    sample_experiment_phi: '',
    sample_experiment_rho: '', 
    sample_detection_method: '', 
    sample_mask_load: '', 
    sample_experiment_date: '', 
    sample_experiment_time: '', 
    sample_experiment_comments: '', 
    sample_device: '', 
    sample_event_type: '', 
    sample_event_link_to_data: '', 
    sample_event_link_to_meta_data: '', 
    sample_event_date: '', 
    sample_event_time: '', 
    sample_event_comments: ''
};

var target_fiducials_itemNamesData = {
    target_event_fid1_validity: '', 
    target_event_fid1_position_name: '', 
    target_event_fid1_x_position: '', 
    target_event_fid1_y_position: '', 
    target_event_fid1_z_position: '', 
    target_event_fid1_experiment_date: '',
    target_event_fid1_experiment_time: '',
    target_event_fid2_validity: '', 
    target_event_fid2_position_name: '', 
    target_event_fid2_x_position: '', 
    target_event_fid2_y_position: '',
    target_event_fid2_z_position: '', 
    target_event_fid2_experiment_date: '', 
    target_event_fid2_experiment_time: '',
    target_event_fid3_validity: '',
    target_event_fid3_position_name: '', 
    target_event_fid3_x_position: '', 
    target_event_fid3_y_position: '', 
    target_event_fid3_z_position: '',
    target_event_fid3_experiment_date: '', 
    target_event_fid3_experiment_time: ''
};
    
var target_data_itemNamesData = {
    target_x_position: '', 
    target_y_position: '', 
    target_z_position: '', 
    targetinfo_experiment_date: '', 
    targetinfo_experiment_time: '',
    target_comments: '', 
    target_device: '', 
    target_event_type: '', 
    target_link_to_data: '', 
    target_link_to_meta_data: '',
    target_event_date: '',
    target_event_time: '', 
    target_event_comments: ''
};

*/
