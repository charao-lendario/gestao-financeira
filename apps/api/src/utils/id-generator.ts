export const generateClienteId = async (
  prisma: any
): Promise<string> => {
  const lastCliente = await prisma.cliente.findFirst({
    orderBy: { criadoEm: 'desc' },
    select: { clienteId: true },
  });

  if (!lastCliente) {
    return 'CLT-0001';
  }

  const lastNumber = parseInt(lastCliente.clienteId.split('-')[1], 10);
  const nextNumber = lastNumber + 1;
  return `CLT-${String(nextNumber).padStart(4, '0')}`;
};

export const generateContratoId = async (
  prisma: any,
  year: number
): Promise<string> => {
  const lastContrato = await prisma.contrato.findFirst({
    where: {
      dataContrato: {
        gte: new Date(year, 0, 1),
        lt: new Date(year + 1, 0, 1),
      },
    },
    orderBy: { criadoEm: 'desc' },
    select: { contratoId: true },
  });

  if (!lastContrato) {
    return `CTR-${year}-0001`;
  }

  const lastNumber = parseInt(lastContrato.contratoId.split('-')[2], 10);
  const nextNumber = lastNumber + 1;
  return `CTR-${year}-${String(nextNumber).padStart(4, '0')}`;
};

export const generateParcelaId = (contratoId: string, numeroParcela: number): string => {
  return `${contratoId}-${String(numeroParcela).padStart(3, '0')}`;
};
