insert into carts (user_id, created_at, updated_at) values (uuid_generate_v4(), CURRENT_DATE, CURRENT_DATE);
insert into carts (user_id, created_at, updated_at) values (uuid_generate_v4(), CURRENT_DATE, CURRENT_DATE);
insert into carts (user_id, created_at, updated_at) values (uuid_generate_v4(), CURRENT_DATE, CURRENT_DATE);

insert into cart_items (product_id, count, cart_id)
select
	uuid_generate_v4(),
	3,
    (select id from carts limit 1);

insert into cart_items (product_id, count, cart_id)
select
	uuid_generate_v4(),
	5,
    (select id from carts limit 1);

insert into cart_items (product_id, count, cart_id)
select
	uuid_generate_v4(),
	1,
    (select id from carts limit 1);