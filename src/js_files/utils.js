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
}

module.exports = {
    BaseClass
}
