import { format } from 'fast-csv';
import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const body = await req.json();
    const { data } = body;

    const headers = new Headers({
      'Content-Disposition': 'attachment; filename="data.csv"',
      'Content-Type': 'text/csv',
    });

    let csvString = '';
    const csvStream = format({ headers: true })
      .on('data', (chunk) => {
        csvString += chunk.toString();
      })
      .on('end', () => {
        return NextResponse.json(csvString, { headers });
      });

    data.forEach((record) => {
      csvStream.write(record);
    });

    csvStream.end();
    return new NextResponse(csvString, { headers });
  } catch (error) {
    return new NextResponse(`Error generating CSV: ${error.message}, { status: 500 }`);
  }
}
