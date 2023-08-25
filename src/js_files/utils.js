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

    getRecordOfTablesQuery(){
        let query = "";
        for(let idx=0; idx < this.list_of_tables.length; idx++){
            query += "SELECT * FROM " + this.list_of_tables[idx]['Tables_in_euxfeltargets_dev'] + "; ";
        }

        return query;
    }
}

module.exports = {
    BaseClass
}
