const {BaseClass} = require('../js_files/utils');

describe('BaseClass', () => {
    test('should get enum tables query', () => {
        const baseclass = new BaseClass();
        const result = baseclass.getEnumTablesQuery();
        expect(result.length).toBe(301);
    });

    test('should get all the definition of enum tables', () => {
        const baseclass = new BaseClass();
        const result = baseclass.enum_tables_list;
        const expected = {
            "Facility_Table": {},
            "SubframeType_Table": {},
            "GroupInformation_Table": {},
            "DeviceType_Table": {},
            "ROIType_Table": {},
            "DeviceList_Table": {},
            "DetectionMethod_Table": {},
            "EventType_Table": {},
            "FiducialPosition_Table": {}
          };
        expect(result).toStrictEqual(expected);
    });
});
