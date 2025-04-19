export default async function createUserTable(supabase) {

  const { data, error } = await supabase.rpc('create_users_table');

  if (error) {
    console.error('Ошибка при создании таблицы c пользователями: ', error);
    throw Error();
  } else {
    console.log('Таблица успешно создана или уже существует: ', data);
  }
}
