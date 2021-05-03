export class ByteReader {
	reader: DataView;
	littleEndian: boolean;
	offset: number;

	constructor(arrayBuffer: ArrayBuffer) {
		this.reader = new DataView(arrayBuffer);
		this.offset = 0;
		this.littleEndian = true;
	}
	
	hasMore(): boolean {
		return (this.reader.byteLength > this.offset);
	}

	static byteToBits(a: number): Array<number> {
		let tmp = new Array<number>();

		for (let i = 128; i >= 1; i /= 2) {
			tmp.unshift(a & i ? 1: 0);
		}

		return tmp;
	}

	readBytes(offset: number, length: number): ArrayBuffer {
		return this.reader.buffer.slice(offset, offset+length);
	}

	skip(i: number) {
		this.offset += i;
	}

	setIndex(i: number) {
		this.offset = i;
	}
	
	readBytesAsBits(numOfBytes: number): Array<number> {
		let result = new Array<number>();

		for (let i=0; i<numOfBytes; i++) {
			result.push(...ByteReader.byteToBits(this.readInt8()));
		}
		
		return result;
	}

	readInt8(): number {
		const result = this.reader.getInt8(this.offset);
		this.offset++;
		return result;
	}

	readUint8(): number {
		const result = this.reader.getUint8(this.offset);
		this.offset++;
		return result;
	}

	readInt16(): number {
		const result = this.reader.getInt16(this.offset, this.littleEndian);
		this.offset+=2;
		return result;
	}

	readUint16(): number {
		const result = this.reader.getUint16(this.offset, this.littleEndian);
		this.offset+=2;
		return result;
	}

	readInt32(): number {
		const result = this.reader.getInt32(this.offset, this.littleEndian);
		this.offset+=4;
		return result;
	}

	readUint32(): number {
		const result = this.reader.getUint32(this.offset, this.littleEndian);
		this.offset+=4;
		return result;
	}

	readFloat32(): number {
		const result = this.reader.getFloat32(this.offset, this.littleEndian);
		this.offset+=4;
		return result;
	}

	readFloat64(): number {
		const result = this.reader.getFloat64(this.offset, this.littleEndian);
		this.offset+=8;
		return result;
	}

	//read two bytes and convert to a string
	readASCII(length: number): string {
		let result = '';

		for (let i=0; i<length; i++) {
			result += String.fromCharCode(this.readUint8());
		}

		return result.replace(/\0+/, ""); //remove empty chars
	}
}
