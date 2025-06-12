create materialized view top_loads_by_value_per_mile as
   select ci.id,
          ci.origin,
          ci.destination,
          ci.carrierpay,
          ci.miles,
          ci.carrierpay / nullif(
             ci.miles,
             0
          ) as value_per_mile,
          i.summary,
          i.createdat
     from carrier_info ci
     join insights i
   on ci."insightId" = i.id
    where ci.miles > 0
    order by value_per_mile desc
    fetch first 5 rows only;

create index idx_value_per_mile on
   carrier_info (
      carrierpay,
      miles
   );