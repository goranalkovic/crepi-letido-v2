// @ts-nocheck
export const GET = async () => {
    const url = "https://gableci.hr/vz/";
    const document = await fetch(url);
    const rawDocument = await document.text();
	
    return rawDocument;
};