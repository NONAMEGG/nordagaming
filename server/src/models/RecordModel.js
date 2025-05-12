export default async function createRecordTable(supabase) {

  const { data, error } = await supabase.rpc('create_records_table');

  if (error) {
    console.error('Ошибка при создании таблицы с рекордами:', error);
    throw Error();
  } else {
    console.log('Таблица с рекордами успешно создана или уже существует: ', data);
  }
}
