import { PAGINATION_QUERY } from '../components/Pagination';

export default function paginationField() {
  return {
    keyArgs: false, // tells Apollo we will take care of everything
    read(existing = [], { args, cache }) {
      // first thing it does is ask the read function for those items
      const { skip, first } = args;
      // Read the number of items on the page from the cache
      const data = cache.readQuery({ query: PAGINATION_QUERY });
      const count = data?._allProductMeta?.count;
      const page = skip / first + 1;
      const pages = Math.ceil(count / first);

      // check if we have existing items
      const items = existing.slice(skip, skip + first).filter((x) => x);

      // if there are items
      // AND there aren't enough items to satisfy how many were requested
      // AND we are on the last page
      // THEN just send it
      if (items.length && items.length !== first && page === pages) {
        return items;
      }

      if (items.length !== first) {
        // we don't have any items, we must got the network to fetch them
        return false;
      }

      // if there are items, return them from the cache
      if (items.length) {
        // console.log(`there are ${items.length} in the cache`);
        return items;
      }

      return false; // fallback to network
    },
    merge(existing, incoming, { args }) {
      const { skip, first } = args;
      // This runs when the Apollo client comes back from the network with our products
      console.log(`Merging items from the network ${incoming.length}`);
      const merged = existing ? existing.slice(0) : [];
      for (let i = skip; i < skip + incoming.length; i++) {
        merged[i] = incoming[i - skip];
      }
      console.log(merged);
      return merged;
    },
  };
}
