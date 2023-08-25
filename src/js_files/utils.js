class BaseClass {
    constructor() {
        this.enum_tables_list = {
            "Facility_Table":{},
            "SubframeType_Table":{},
            "GroupInformation_Table":{},
            "DeviceType_Table":{},
            "ROIType_Table":{},
            "DeviceList_Table":{},
            "DetectionMethod_Table":{},
            "EventType_Table":{},
            "FiducialPosition_Table":{},
        };

        this.list_of_tables = [];
    }

    getEnumTablesQuery(){
        let query = "";
        for(let idx=0; idx < Object.keys(this.enum_tables_list).length; idx++){
            query += "SELECT * FROM " + Object.keys(this.enum_tables_list)[idx] + "; ";
        }
        return query;
    }

    digestEnumValues(values){
        let counter = 0;
        for(let key in this.enum_tables_list){
            this.enum_tables_list[key] = values[counter];
            counter++;
        }
    }

    getFacilityID(value) {
        let facility_id = '';
        for(let idx=0; idx < this.enum_tables_list['Facility_Table'].length; idx++){
            if(this.enum_tables_list['Facility_Table'][idx]['Name'] == value){
                facility_id = this.enum_tables_list['Facility_Table'][idx]['ID'];
                break;
            }
        }
        return facility_id;
    }

    getSubframeTypeID(value) {
        let subframe_type_id = '';
        for(let idx=0; idx < this.enum_tables_list['SubframeType_Table'].length; idx++){
            if(this.enum_tables_list['SubframeType_Table'][idx]['TypeName'] == value){
                subframe_type_id = this.enum_tables_list['SubframeType_Table'][idx]['ID'];
                break;
            }
        }
        return subframe_type_id;
    }

    getSubframeSerialNumber(value){
        if (value===null)
            value = 1;
        
        let concat_zeros = 6 - value.toString().length;
        let serial_number_text = value.toString();

        if(concat_zeros>0){
            for(let idx=0; idx < concat_zeros; idx++){
                serial_number_text = '0' + serial_number_text;
            }
        }

        return serial_number_text;
    }

    getFacilityCodeName(value) {
        let facility_code_name = '';
        for(let idx=0; idx < this.enum_tables_list['Facility_Table'].length; idx++){
            if (this.enum_tables_list['Facility_Table'][idx]['ID'] == value) {
                facility_code_name = this.enum_tables_list['Facility_Table'][idx]['CodeName'];
                break;
            }
        }
        return facility_code_name;
    }

    getSubframeTypeName(value) {
        let subframe_type_name = '';
        for(let idx=0; idx < this.enum_tables_list['SubframeType_Table'].length; idx++){
            if (this.enum_tables_list['SubframeType_Table'][idx]['ID'] == value) {
                subframe_type_name = this.enum_tables_list['SubframeType_Table'][idx]['TypeName'];
                break;
            }
        }
        return subframe_type_name;
    }

    getRecordOfTablesQuery(){
        let query = "";
        for(let idx=0; idx < this.list_of_tables.length; idx++){
            query += "SELECT * FROM " + this.list_of_tables[idx]['Tables_in_euxfeltargets_dev'] + "; ";
        }

        return query;
    }

    getSubframeFiltersQuery(values) {
        let loaded_subframe_filters = {};
        let query = '';
        let filters_facility = values.filters_facility;
        let filters_group = values.filters_group;
        let filters_subframe_type = values.filters_subframe_type;
        let filters_start_date = values.filters_start_date;
        let filters_end_date = values.filters_end_date;

        query += "SELECT * FROM Subframe_Table";
        let where_flag = false;

        if (filters_facility != 'Not Specified'){
            loaded_subframe_filters["filters_facility"] = filters_facility;

            for(let idx=0; idx < this.enum_tables_list['Facility_Table'].length; idx++){
                if(this.enum_tables_list['Facility_Table'][idx]['Name'] == filters_facility) {
                    query += " WHERE FacilityID=" + this.enum_tables_list['Facility_Table'][idx]['ID'];
                    break;
                }
            }

            where_flag = true;
        }
        
        if (filters_group != 'Not Specified'){
            loaded_subframe_filters["filters_group"] = filters_group;
            
            for(let idx=0; idx < this.enum_tables_list['GroupInformation_Table'].length; idx++){
                if(this.enum_tables_list['GroupInformation_Table'][idx]['GroupName'] == filters_group) {
                    if (where_flag)
                        query += " AND GroupID=" + this.enum_tables_list['GroupInformation_Table'][idx]['ID'];
                    else {
                        query += " WHERE GroupID=" + this.enum_tables_list['GroupInformation_Table'][idx]['ID'];
                        where_flag = true;
                    }

                    break;
                }
            }
        }
    
        if (filters_subframe_type != 'Not Specified') {
            loaded_subframe_filters["filters_subframe_type"] = filters_subframe_type;
    
            for(let idx=0; idx < this.enum_tables_list['SubframeType_Table'].length; idx++){
                if(this.enum_tables_list['SubframeType_Table'][idx]['TypeName'] == filters_subframe_type) {
                    if (where_flag)
                        query += " AND SubframeTypeID=" + this.enum_tables_list['SubframeType_Table'][idx]['ID'];
                    else {
                        query += " WHERE SubframeTypeID=" + this.enum_tables_list['SubframeType_Table'][idx]['ID'];
                        where_flag = true;
                    }

                    break;
                }
            }
        }
    
        if (filters_start_date != '') {
            loaded_subframe_filters["filters_start_date"] = filters_start_date;
    
            if (where_flag)
                query += " AND CreateTimeStamp >='" + filters_start_date + "'";
            else {
                query += " WHERE CreateTimeStamp >='" + filters_start_date + "'";
                where_flag = true;
            }
        }
    
        if (filters_end_date != '') {
            loaded_subframe_filters["filters_end_date"] = filters_end_date;
    
            if (where_flag)
                query += " AND CreateTimeStamp <='" + filters_end_date + "'";
            else {
                query += " WHERE CreateTimeStamp <='" + filters_end_date + "'";
                where_flag = true;
            }
        }

        return [query, loaded_subframe_filters];
    }

    generateSubframeIDs(values){
        let subframe_ids = [];
        for(let idx=0; idx < values.length; idx++){
            let subframe_id = "";
            subframe_id += this.getFacilityCodeName(values[idx]['FacilityID']);
            subframe_id += this.getSubframeTypeName(values[idx]['SubframeTypeID']);
            subframe_id += this.getSubframeSerialNumber(values[idx]['SerialNumber']);
            subframe_ids.push(subframe_id);            
        }
        return subframe_ids;
    }
}

module.exports = {
    BaseClass
}
