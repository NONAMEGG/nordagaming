export default async function createTransactionTable(supabase) {

  const { data, error } = await supabase.rpc('create_transactions_table');

  if (error) {
    console.error('Ошибка при создании таблицы с транзакциями: ', error);
    throw Error();
  } else {
    console.log('Таблица успешно создана или уже существует: ', data);
  }
}
