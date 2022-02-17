export function catchErrors(fn) {
  return (req, res, next) => fn(req, res, next).catch(next);
}

export const PAGE_SIZE = 50;

export async function pagingInfo({
  page, offset, totalRegistrations, registrationsLength, baseUrl = '',
} = {}) {
  return {
    page,
    total: totalRegistrations,
    totalPages: Math.ceil(totalRegistrations / PAGE_SIZE),
    first: offset === 0,
    last: registrationsLength < PAGE_SIZE,
    hasPrev: offset > 0,
    hasNext: registrationsLength === PAGE_SIZE,
    prevUrl: `${baseUrl}/?page=${page - 1}`,
    nextUrl: `${baseUrl}/?page=${page + 1}`,
  };
}

export function setPagenumber(page) {
  const num = Number(page);

  if (Number.isNaN(num) || !Number.isInteger(num) || num < 1) {
    return 1;
  }

  return num;
}
