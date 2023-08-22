class Subframe {
    constructor() {
        this.subframeids = [];
        this.internal_id = '';
        this.external_id = '';
        this.header = '';
        this.rois = [];
    }

    getSubframesQuery(){
        return "SELECT ID, SubframeTypeID, FacilityID, SerialNumber" +
               " FROM Subframe_Table; ";
    }

    generateSubframeIDs(enum_tables, values){
        let subframe_id = "";
        
        for(let idx=0; idx < values.length; idx++){
            subframe_id = "";
            for(let iter=0; iter < enum_tables['Facility_Table'].length; iter++){
                if(values[idx]['FacilityID']==enum_tables['Facility_Table'][iter]['ID']){
                    subframe_id += enum_tables['Facility_Table'][iter]['CodeName'];
                    break;
                }
            }

            for(let iter=0; iter < enum_tables['SubframeType_Table'].length; iter++){
                if(values[idx]['SubframeTypeID']==enum_tables['SubframeType_Table'][iter]['ID']){
                    subframe_id += enum_tables['SubframeType_Table'][iter]['TypeName'];
                    break;
                }
            }

            let padd_length = 6-values[idx]['SerialNumber'].toString().length;
            let serial_number_str = values[idx]['SerialNumber'].toString();
            for (let iter=0; iter < padd_length; iter++){
                serial_number_str = "0" + serial_number_str;
            }
            
            subframe_id += serial_number_str;
            this.subframeids.push([values[idx]['ID'], subframe_id]);
        }
    }

    findSubframeInternalID(){
        for(let idx=0; idx < this.subframeids.length; idx++){
            if(this.subframeids[idx][1]==this.external_id){
                this.internal_id = this.subframeids[idx][0];
                break;
            }
        }
    }

    generateSubframeHeader(enum_tables, values){
        if (values[0]['GroupID'] != null){
            for(let idx=0; idx < enum_tables['GroupInformation_Table'].length; idx++){
                if(enum_tables['GroupInformation_Table']['ID'] == values[0]['GroupID']){
                    values[0]['GroupID'] = enum_tables['GroupInformation_Table'][idx]['GroupName'];
                    break;
                }
            }
        }

        for(let idx=0; idx < enum_tables['Facility_Table'].length; idx++){
            if(this.external_id.substring(0, 5) == enum_tables['Facility_Table'][idx]['CodeName']){
                values[0]['FacilityID'] = enum_tables['Facility_Table'][idx]['Name'];
                break;
            }
        }

        values[0]['SubframeTypeID'] = this.external_id.substring(5, 8);

        this.header = values;
    }

    generateROIIDs(values){
        this.rois = values;
    }
}

module.exports = {
    Subframe
}
