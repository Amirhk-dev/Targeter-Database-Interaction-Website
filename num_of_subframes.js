//jshint esversion:6

let mysql = require('mysql'); 
exports.getNumberOfFrames = function(){
    let connection = mysql.createConnection({
        host	 : 'mydevadmin.xfel.eu',
        user	 : 'euxfeltargets_dev',
        database : 'euxfeltargets_dev',
        password : 'L*-bQyK,JU&[',
        multipleStatements: true
        });

    let q = "SELECT COUNT(*) as count FROM Subframe";
    let result = connection.query(q, function(err, results){
        if(err) 
            throw err;
        else            
            return results[0].count;
    });   

    return result;
}