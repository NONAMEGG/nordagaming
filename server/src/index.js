import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { supabase } from "./utils/supabase.js";  
import CreateTables from "./models/index.js";
import { router } from "./routes/index.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use('/api', router);

const start = async () =>{
  try{
    const { data: dropData, error: dropError } = await supabase
      .rpc('drop_tables');

    if (dropError) {
      console.error('Ошибка при удалении таблиц:', dropError);
      return;
    }
    console.log('Таблицы удалены (если существовали).', dropData);
    
    await CreateTables(supabase); 
    console.log('Таблицы были созданы');
  }
  catch(error){
    console.log('Ошибка при создании таблиц', error);
  }
}

try {
  start();
  app.listen(process.env.PORT, () => {
  console.log(`Server listening on port ${process.env.PORT}`);
});
} catch (e){
  console.log('Ошибка при запуске сервера')
}

