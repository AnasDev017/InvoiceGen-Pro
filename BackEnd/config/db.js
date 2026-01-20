import mongoose  from "mongoose";
import { configDotenv } from "dotenv";
configDotenv()
 const connentDB = ()=>{
    try {
          mongoose.connect(process.env.DATA_BASE_URL)
        console.log("DATA BASE CONNECTED!");
    } catch (error) {
        console.log(error);
    }
}
export default connentDB