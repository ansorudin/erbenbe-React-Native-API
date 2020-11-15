// use hoteloka;
// select * from rooms;

// -- room yang booked tanggal 5 harusnya ada 4

// -- 5
// -- 1 -7 => true
// -- 5 - 6 => true
// -- 6 - 7 => false
// -- 4 - 5 => false

// ***** buat function room yg udah ke book

// delimiter $$
// create function get_id_room_booked(
// 	search_date datetime,
//     check_in_date datetime,
//     check_out_date datetime,
//     id INT
// )

//  returns int
//  deterministic

//  begin
//  	declare id_room int;
//      if(DATE(search_date) >= DATE(check_in_date) and date(search_date) < date(check_out_date))
// 		then set id_room = id;
// 	else
// 		set id_room = 0;
//  	end if;
// 		return (id_room);
//  end $$
//  delimiter ;
 
//  -- room booked at 5 nov
//  select * from rooms where id in
//  (select get_id_room_booked('2020-11-05', begin_book_date, end_book_date, rooms_id ) from transactions) ;
 
//  -- get room available in spesific date 5 nov 2020 (9 rooms)
//  -- ditotal room yang udah ke book
 
//  select COUNT(get_id_room_booked('2020-11-05', begin_book_date, end_book_date, rooms_id )) from transactions
//  where get_id_room_booked('2020-11-05', begin_book_date, end_book_date, rooms_id ) = 6;
//  -- hasilnya di tanggal 5 untuk room id 6 ada yg ke book 3 kamar jika dilihat id 6 memiliki 3 kamar berarti full booked
 

// *** buat funtion id room yang yg avail

// delimiter $$
// create function get_id_room_avail(
// 	search_date datetime,
//     id_to_search INT,
//     count_rooms INT
// )

//  returns int
//  deterministic

//  begin
//  	declare id_room int;
//     declare total_booked int;
     
// 	select COUNT(get_id_room_booked(search_date, begin_book_date, end_book_date, rooms_id )) into total_booked from transactions
// 	where get_id_room_booked(search_date, begin_book_date, end_book_date, rooms_id ) = id_to_search;
     
// 	if total_booked >= count_rooms
// 		then set id_room = 0;
// 	else
// 		set id_room = id_to_search;
// 	end if;
// 	return (id_room) ;
     
//  end $$
//  delimiter ;
 
//  drop function get_id_room_avail;
 
//  -- get id room yg avail di tanggal 5 nov 2020 dengan memasukan parameter search date, id, room counts
//  select get_id_room_avail ('2020-11-05', id, room_counts) from rooms;

// *** buat function buat liat room yang avail

// delimiter $$
// create function get_room_available(
// 	search_date datetime,
//     id_to_search INT,
//     count_rooms INT
// )

//  returns int
//  deterministic

//  begin
//  	declare count_rooms_available int;
//     declare total_booked int;
     
// 	select COUNT(get_id_room_booked(search_date, begin_book_date, end_book_date, rooms_id )) into total_booked from transactions
// 	where get_id_room_booked(search_date, begin_book_date, end_book_date, rooms_id ) = id_to_search;
     
// 	set count_rooms_available = count_rooms - total_booked;
// 	return (count_rooms_available) ;
     
//  end $$
//  delimiter ;

// select *,get_room_available('2020-11-05', id, room_counts) from rooms;