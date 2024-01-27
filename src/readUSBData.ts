// The code in this file originally comes
// from https://github.com/tidepool-org/uploader/blob/master/lib/drivers/roche/utils.js
// and https://github.com/tidepool-org/uploader/blob/master/lib/drivers/roche/accuChekUSB.js
// and https://github.com/tidepool-org/uploader/blob/master/lib/commonFunctions.js
// and contains additional modifications

/*
 * == BSD2 LICENSE ==
 * Copyright (c) 2019, Tidepool Project
 *
 * This program is free software; you can redistribute it and/or modify it under
 * the terms of the associated License, which is identical to the BSD 2-Clause
 * License as published by the Open Source Initiative at opensource.org.
 *
 * This program is distributed in the hope that it will be useful, but WITHOUT
 * ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS
 * FOR A PARTICULAR PURPOSE. See the License for more details.
 *
 * You should have received a copy of the License along with this program; if
 * not, you can obtain one from Tidepool Project at tidepool.org.
 * == BSD2 LICENSE ==
 */

const debug = console.log;

const bytes2hex = (bytes: Uint8Array) => {
  var message = "";
  for (var i in bytes) {
    var hex = bytes[i].toString(16).toUpperCase();
    if (hex.length === 1) {
      message += "0";
    }
    message += hex;
  }
  return message;
};

const formatTimestamp = (str: string): string =>
  `${str.substring(0, 4)}-${str.substring(4, 6)}-${str.substring(
    6,
    8
  )}T${str.substring(8, 10)}:${str.substring(10, 12)}` as any;

const models = [
  {
    name: "Aviva Connect",
    numbers: [483, 484, 497, 498, 499, 500, 502, 685],
  },
  { name: "Performa Connect", numbers: [479, 501, 503, 765] },
  { name: "Guide", numbers: [921, 922, 923, 925, 926, 929, 930, 932] },
  {
    name: "Instant (single-button)",
    numbers: [958, 959, 960, 961, 963, 964, 965],
  },
  { name: "Guide Me", numbers: [897, 898, 901, 902, 903, 904, 905] },
  {
    name: "Instant (two-button)",
    numbers: [972, 973, 975, 976, 977, 978, 979, 980],
  },
  {
    name: "Instant S (single-button)",
    numbers: [966, 967, 968, 969, 970, 971],
  },
  { name: "ReliOn Platinum", numbers: [982] },
];

const getModelName = (number: number) => {
  // eslint-disable-next-line no-restricted-syntax
  for (const i in models) {
    if (models[i].numbers.indexOf(number) >= 0) {
      return models[i].name;
    }
  }
  return `Unknown model ${number}`;
};

const APDU_TYPE = {
  ASSOCIATION_REQUEST: 0xe200,
  ASSOCIATION_RESPONSE: 0xe300,
  ASSOCIATION_RELEASE_REQUEST: 0xe400,
  ASSOCIATION_RELEASE_RESPONSE: 0xe500,
  ASSOCIATION_ABORT: 0xe600,
  PRESENTATION_APDU: 0xe700,
};

const EVENT_TYPE = {
  MDC_NOTI_CONFIG: 0x0d1c,
  MDC_NOTI_SEGMENT_DATA: 0x0d21,
};

const ACTION_TYPE = {
  MDC_ACT_SEG_GET_INFO: 0x0c0d,
  MDC_ACT_SEG_GET_ID_LIST: 0x0c1e,
  MDC_ACT_SEG_TRIG_XFER: 0x0c1c,
  MDC_ACT_SEG_SET_TIME: 0x0c17,
};

const DATA_ADPU = {
  INVOKE_GET: 0x0103,
  INVOKE_CONFIRMED_ACTION: 0x0107,
  RESPONSE_CONFIRMED_EVENT_REPORT: 0x0201,
  RESPONSE_GET: 0x0203,
  RESPONSE_CONFIRMED_ACTION: 0x0207,
};

const DATA_RESPONSE = {
  0: "Transfer successful",
  1: "No such segment",
  2: "Try again later",
  3: "Segment is empty",
  512: "Failed to retrieve segment",
};

const MDC_PART_OBJ = {
  MDC_MOC_VMO_METRIC: 4,
  MDC_MOC_VMO_METRIC_ENUM: 5,
  MDC_MOC_VMO_METRIC_NU: 6,
  MDC_MOC_VMO_METRIC_SA_RT: 9,
  MDC_MOC_SCAN: 16,
  MDC_MOC_SCAN_CFG: 17,
  MDC_MOC_SCAN_CFG_EPI: 18,
  MDC_MOC_SCAN_CFG_PERI: 19,
  MDC_MOC_VMS_MDS_SIMP: 37,
  MDC_MOC_VMO_PMSTORE: 61,
  MDC_MOC_PM_SEGMENT: 62,
  MDC_ATTR_CONFIRM_MODE: 2323,
  MDC_ATTR_CONFIRM_TIMEOUT: 2324,
  MDC_ATTR_TRANSPORT_TIMEOUT: 2694,
  MDC_ATTR_ID_HANDLE: 2337,
  MDC_ATTR_ID_INSTNO: 2338,
  MDC_ATTR_ID_LABEL_STRING: 2343,
  MDC_ATTR_ID_MODEL: 2344,
  MDC_ATTR_ID_PHYSIO: 2347,
  MDC_ATTR_ID_PROD_SPECN: 2349,
  MDC_ATTR_ID_TYPE: 2351,
  MDC_ATTR_METRIC_STORE_CAPAC_CNT: 2369,
  MDC_ATTR_METRIC_STORE_SAMPLE_ALG: 2371,
  MDC_ATTR_METRIC_STORE_USAGE_CNT: 2372,
  MDC_ATTR_MSMT_STAT: 2375,
  MDC_ATTR_NU_ACCUR_MSMT: 2378,
  MDC_ATTR_NU_CMPD_VAL_OBS: 2379,
  MDC_ATTR_NU_VAL_OBS: 2384,
  MDC_ATTR_NUM_SEG: 2385,
  MDC_ATTR_OP_STAT: 2387,
  MDC_ATTR_POWER_STAT: 2389,
  MDC_ATTR_SA_SPECN: 2413,
  MDC_ATTR_SCALE_SPECN_I16: 2415,
  MDC_ATTR_SCALE_SPECN_I32: 2416,
  MDC_ATTR_SCALE_SPECN_I8: 2417,
  MDC_ATTR_SCAN_REP_PD: 2421,
  MDC_ATTR_SEG_USAGE_CNT: 2427,
  MDC_ATTR_SYS_ID: 2436,
  MDC_ATTR_SYS_TYPE: 2438,
  MDC_ATTR_TIME_ABS: 2439,
  MDC_ATTR_TIME_BATT_REMAIN: 2440,
  MDC_ATTR_TIME_END_SEG: 2442,
  MDC_ATTR_TIME_PD_SAMP: 2445,
  MDC_ATTR_TIME_REL: 2447,
  MDC_ATTR_TIME_STAMP_ABS: 2448,
  MDC_ATTR_TIME_STAMP_REL: 2449,
  MDC_ATTR_TIME_START_SEG: 2450,
  MDC_ATTR_TX_WIND: 2453,
  MDC_ATTR_UNIT_CODE: 2454,
  MDC_ATTR_UNIT_LABEL_STRING: 2457,
  MDC_ATTR_VAL_BATT_CHARGE: 2460,
  MDC_ATTR_VAL_ENUM_OBS: 2462,
  MDC_ATTR_TIME_REL_HI_RES: 2536,
  MDC_ATTR_TIME_STAMP_REL_HI_RES: 2537,
  MDC_ATTR_DEV_CONFIG_ID: 2628,
  MDC_ATTR_MDS_TIME_INFO: 2629,
  MDC_ATTR_METRIC_SPEC_SMALL: 2630,
  MDC_ATTR_SOURCE_HANDLE_REF: 2631,
  MDC_ATTR_SIMP_SA_OBS_VAL: 2632,
  MDC_ATTR_ENUM_OBS_VAL_SIMP_OID: 2633,
  MDC_ATTR_ENUM_OBS_VAL_SIMP_STR: 2634,
  MDC_REG_CERT_DATA_LIST: 2635,
  MDC_ATTR_NU_VAL_OBS_BASIC: 2636,
  MDC_ATTR_PM_STORE_CAPAB: 2637,
  MDC_ATTR_PM_SEG_MAP: 2638,
  MDC_ATTR_PM_SEG_PERSON_ID: 2639,
  MDC_ATTR_SEG_STATS: 2640,
  MDC_ATTR_SEG_FIXED_DATA: 2641,
  MDC_ATTR_SCAN_HANDLE_ATTR_VAL_MAP: 2643,
  MDC_ATTR_SCAN_REP_PD_MIN: 2644,
  MDC_ATTR_ATTRIBUTE_VAL_MAP: 2645,
  MDC_ATTR_NU_VAL_OBS_SIMP: 2646,
  MDC_ATTR_PM_STORE_LABEL_STRING: 2647,
  MDC_ATTR_PM_SEG_LABEL_STRING: 2648,
  MDC_ATTR_TIME_PD_MSMT_ACTIVE: 2649,
  MDC_ATTR_SYS_TYPE_SPEC_LIST: 2650,
  MDC_ATTR_METRIC_ID_PART: 2655,
  MDC_ATTR_ENUM_OBS_VAL_PART: 2656,
  MDC_ATTR_SUPPLEMENTAL_TYPES: 2657,
  MDC_ATTR_TIME_ABS_ADJUST: 2658,
  MDC_ATTR_CLEAR_TIMEOUT: 2659,
  MDC_ATTR_TRANSFER_TIMEOUT: 2660,
  MDC_ATTR_ENUM_OBS_VAL_SIMP_BIT_STR: 2661,
  MDC_ATTR_ENUM_OBS_VAL_BASIC_BIT_STR: 2662,
  MDC_ATTR_METRIC_STRUCT_SMALL: 2675,
  MDC_ATTR_NU_CMPD_VAL_OBS_SIMP: 2676,
  MDC_ATTR_NU_CMPD_VAL_OBS_BASIC: 2677,
  MDC_ATTR_ID_PHYSIO_LIST: 2678,
  MDC_ATTR_SCAN_HANDLE_LIST: 2679,
  MDC_ATTR_TIME_BO: 2689,
  MDC_ATTR_TIME_STAMP_BO: 2690,
  MDC_ATTR_TIME_START_SEG_BO: 2691,
  MDC_ATTR_TIME_END_SEG_BO: 2692,
};

const PROD_SPEC_ENTRY = [
  "unspecified",
  "serial-number",
  "part-number",
  "hw-revision",
  "sw-revision",
  "fw-revision",
  "protocol-revision",
  "prod-spec-gmdn",
];

const getObject = (bytes: DataView, type: number) => {
  let offset = 28;
  const count = bytes.getUint16(24);

  for (let i = 0; i < count; i++) {
    const objClass = bytes.getUint16(offset);
    const handle = bytes.getUint16(offset + 2);
    const attributeCount = bytes.getUint16(offset + 4);
    const length = bytes.getUint16(offset + 6);

    offset += length + 8;

    if (type === objClass) {
      return {
        handle,
        attributeCount,
        bytes: new DataView(bytes.buffer.slice(offset - length, offset)),
      };
    }
  }

  return null;
};

const getAttributeList = (bytes: DataView) => {
  let offset = 14;

  const attributeCount = bytes.getUint16(offset);
  const length = bytes.getUint16(offset + 2);
  offset += 4;
  return {
    attributeCount,
    bytes: new DataView(bytes.buffer.slice(offset, offset + length)),
  };
};

const getProductionSpecEntry = (bytes: DataView, entry: string) => {
  let offset = 0;
  const count = bytes.getUint16(offset);

  for (let i = 0; i < count; i++) {
    const type = PROD_SPEC_ENTRY[bytes.getUint16(offset + 4)];
    const length = bytes.getUint16(offset + 8);
    offset += length + 10;

    if (entry === type) {
      return new DataView(bytes.buffer.slice(offset - length, offset));
    }
  }

  return null;
};

const getAttribute = (
  obj: { attributeCount: number; bytes: DataView },
  type: number
) => {
  let offset = 0;

  for (let i = 0; i < obj.attributeCount; i++) {
    const attributeId = obj.bytes.getUint16(offset);
    const length = obj.bytes.getUint16(offset + 2);

    offset += length + 4;

    if (type === attributeId) {
      return new DataView(obj.bytes.buffer.slice(offset - length, offset));
    }
  }

  return null;
};

const timeout = (delay = 5000) =>
  new Promise<never>((resolve, reject) =>
    setTimeout(reject, delay, new Error("Timeout error"))
  );

interface USBDeviceAndConfig {
  usbDevice: USBDevice;
  outEPnum: number;
  inEPnum: number;
}

const openDevice = async (usbDevice: USBDevice) => {
  await usbDevice.open();

  if (usbDevice.configuration == null) {
    debug("Selecting configuration 1");
    await usbDevice.selectConfiguration(1);
  }

  if (usbDevice.configuration?.interfaces == null) {
    throw new Error("Please unplug device and retry.");
  }

  const [iface] = usbDevice.configuration.interfaces;

  debug("Claiming interface", iface.interfaceNumber);
  await usbDevice.claimInterface(iface.interfaceNumber);

  const epOut = iface.alternate.endpoints.find((ep) => ep.direction === "out")!;
  const epIn = iface.alternate.endpoints.find((ep) => ep.direction === "in")!;

  const usbconfig: USBDeviceAndConfig = {
    usbDevice,
    outEPnum: epOut.endpointNumber,
    inEPnum: epIn.endpointNumber,
  };

  await usbDevice.controlTransferIn(
    {
      requestType: "standard",
      recipient: "device",
      request: 0x00,
      value: 0x00,
      index: 0x00,
    },
    2
  );

  const incoming = await Promise.race([
    timeout(),
    usbDevice.transferIn(usbconfig.inEPnum, 1024),
  ]);

  debug("Status:", incoming.status);

  if (incoming.status === "babble") {
    throw new Error("Device left plugged in for too long.");
  }

  debug(
    "Received association request:",
    bytes2hex(new Uint8Array(incoming.data!.buffer))
  );

  await usbDevice.transferOut(usbconfig.outEPnum, buildAssociationResponse());

  return usbconfig;
};

interface ConfigData {
  extendedConfig: DataView;
  pmStoreHandle: number;
  numberOfSegments: number;
  deviceDetails: DataView;
  pmStoreConfig: DataView;
  lastInvokeId: number;
}

const getConfig = async (
  usbConfig: USBDeviceAndConfig
): Promise<ConfigData> => {
  const data: Partial<ConfigData> = {};
  let incoming: USBInTransferResult;

  async function getPMStore() {
    incoming = await Promise.race([
      timeout(),
      usbConfig.usbDevice.transferIn(usbConfig.inEPnum, 1024),
    ]);
    debug(
      "Received extended config:",
      bytes2hex(new Uint8Array(incoming.data!.buffer))
    );
    data.extendedConfig = incoming.data!;

    if (incoming == null) {
      throw Error("Could not retrieve config. Please retry.");
    }

    return getObject(incoming.data!, MDC_PART_OBJ.MDC_MOC_VMO_PMSTORE);
  }

  let pmStoreDetails = await getPMStore();

  if (pmStoreDetails == null) {
    debug("Invalid config, trying again...");

    await usbConfig.usbDevice.transferOut(
      usbConfig.outEPnum,
      buildAssociationResponse()
    );

    pmStoreDetails = await getPMStore();

    if (pmStoreDetails == null) {
      throw Error("Could not parse config. Please retry.");
    }
  }
  data.pmStoreHandle = pmStoreDetails.handle;
  data.numberOfSegments = getAttribute(
    pmStoreDetails,
    MDC_PART_OBJ.MDC_ATTR_NUM_SEG
  )!.getUint16(0);

  let invokeId = incoming!.data!.getUint16(6);
  await usbConfig.usbDevice.transferOut(
    usbConfig.outEPnum,
    buildConfigResponse(invokeId)
  );

  await usbConfig.usbDevice.transferOut(
    usbConfig.outEPnum,
    buildMDSAttributeRequest(invokeId)
  );
  incoming = await usbConfig.usbDevice.transferIn(usbConfig.inEPnum, 1024);
  debug(
    "Received MDS attribute response:",
    bytes2hex(new Uint8Array(incoming.data!.buffer))
  );
  invokeId = incoming.data!.getUint16(6);
  data.deviceDetails = incoming.data!;

  await usbConfig.usbDevice.transferOut(
    usbConfig.outEPnum,
    buildActionRequest(invokeId, data.pmStoreHandle)
  );
  incoming = await usbConfig.usbDevice.transferIn(usbConfig.inEPnum, 1024);
  debug(
    "Received action request response:",
    bytes2hex(new Uint8Array(incoming.data!.buffer))
  );
  data.pmStoreConfig = incoming.data!;

  data.lastInvokeId = incoming.data!.getUint16(6);

  return data as any;
};

const setTime = async (
  usbConfig: USBDeviceAndConfig,
  invokeId: number,
  timestamp: bigint
) => {
  await usbConfig.usbDevice.transferOut(
    usbConfig.outEPnum,
    buildSetTimeRequest(invokeId, timestamp)
  );
  const incoming = await usbConfig.usbDevice.transferIn(
    usbConfig.inEPnum,
    1024
  );
  const lastInvokeId = incoming.data!.getUint16(6);
  debug(
    "Received set time response:",
    bytes2hex(new Uint8Array(incoming.data!.buffer))
  );

  return lastInvokeId;
};

const getData = async (
  usbConfig: USBDeviceAndConfig,
  invokeId: number,
  pmStoreHandle: number
) => {
  const pages: DataView[] = [];
  let done = false;
  const segment = 0;

  // these requests need to be sequential
  // eslint-disable-next-line no-await-in-loop
  await usbConfig.usbDevice.transferOut(
    usbConfig.outEPnum,
    buildDataTransferRequest(invokeId, pmStoreHandle, segment)
  );

  // these requests need to be sequential
  // eslint-disable-next-line no-await-in-loop
  const incoming = await usbConfig.usbDevice.transferIn(
    usbConfig.inEPnum,
    1024
  );
  debug(
    "Received data transfer request response:",
    bytes2hex(new Uint8Array(incoming.data!.buffer))
  );

  if (incoming.data!.byteLength === 22 && incoming.data!.getUint16(20)) {
    const dataResponse = incoming.data!.getUint16(20);
    if (dataResponse === 3) {
      debug("Segment was empty");
    } else {
      throw new Error(
        `Could not retrieve data: ${(DATA_RESPONSE as any)[dataResponse]}`
      );
    }
  } else if (
    incoming.data!.byteLength < 22 ||
    incoming.data!.getUint16(14) !== ACTION_TYPE.MDC_ACT_SEG_TRIG_XFER
  ) {
    throw new Error("Unexpected response");
  } else {
    while (!done) {
      // these requests need to be sequential
      // eslint-disable-next-line no-await-in-loop
      const { data } = await usbConfig.usbDevice.transferIn(
        usbConfig.inEPnum,
        1024
      );
      debug("Data:", bytes2hex(new Uint8Array(data!.buffer)));
      pages.push(data!);

      const dataInvokeId = data!.getUint16(6);
      const segmentDataResult = new DataView(data!.buffer.slice(22, 32));
      const status = data!.getUint8(32);

      /* eslint-disable-next-line no-bitwise */
      if (status & 0x40) {
        // the second bit of the status field indicates if it's the last one
        done = true;
      }

      // these requests need to be sequential
      // eslint-disable-next-line no-await-in-loop
      await usbConfig.usbDevice.transferOut(
        usbConfig.outEPnum,
        buildDataTransferConfirmation(
          dataInvokeId,
          pmStoreHandle,
          segmentDataResult
        )
      );
    }
  }

  return pages;
};

export interface Measurement {
  timestamp: string;
  value: number;
  status: number;
}

const parseData = (pages: DataView[]) => {
  const records: Measurement[] = [];

  pages.forEach((page) => {
    let offset = 30;
    const entries = page.getUint16(offset);

    for (let i = 0; i < entries; i++) {
      const timestamp = page.buffer.slice(offset + 6, offset + 12);
      const record: Measurement = {
        timestamp: formatTimestamp(bytes2hex(new Uint8Array(timestamp))),
        value: page.getUint16(offset + 14),
        status: page.getUint16(offset + 16),
      };
      offset += 12;
      records.push(record);
    }
  });

  return records;
};

const buildAssociationResponse = () => {
  const buf = new ArrayBuffer(48);
  const buffer = new DataView(buf);

  buffer.setUint16(0, APDU_TYPE.ASSOCIATION_RESPONSE);
  buffer.setUint16(2, 44); // Length (excludes initial 4 bytes)
  buffer.setUint16(4, 0x0003); // accepted-unknown-config
  buffer.setUint16(6, 20601); // data-proto-id
  buffer.setUint16(8, 38); // data-proto-info length
  buffer.setUint32(10, 0x80000002); // protocolVersion
  buffer.setUint16(14, 0x8000); // encoding-rules = MDER
  buffer.setUint32(16, 0x80000000); // nomenclatureVersion
  buffer.setUint32(20, 0); // functionalUnits = normal association
  buffer.setUint32(24, 0x80000000); // systemType = sys-type-manager
  buffer.setUint16(28, 8); // system-id length
  buffer.setUint32(30, 0x12345678); // system-id high
  buffer.setUint32(34, 0x87654321); // system-id low
  // rest of bytes should always be 0x00 for manager response

  debug("Association response:", bytes2hex(new Uint8Array(buf)));

  return buffer.buffer;
};

const buildAssociationReleaseRequest = () => {
  const buf = new ArrayBuffer(6);
  const buffer = new DataView(buf);

  buffer.setUint16(0, APDU_TYPE.ASSOCIATION_RELEASE_REQUEST);
  buffer.setUint16(2, 2); // length  = 2
  buffer.setUint16(4, 0x0000); // normal

  debug("Association release:", bytes2hex(new Uint8Array(buf)));

  return buffer.buffer;
};

const buildConfigResponse = (invokeId: number) => {
  const buf = new ArrayBuffer(26);
  const buffer = new DataView(buf);

  buffer.setUint16(0, APDU_TYPE.PRESENTATION_APDU);
  buffer.setUint16(2, 22); // length
  buffer.setUint16(4, 20); // octet stringlength
  buffer.setUint16(6, invokeId); // invoke-id from config
  buffer.setUint16(8, DATA_ADPU.RESPONSE_CONFIRMED_EVENT_REPORT);
  buffer.setUint16(10, 14); // length
  buffer.setUint16(12, 0); // obj-handle = 0
  buffer.setUint32(14, 0); // currentTime = 0
  buffer.setUint16(18, EVENT_TYPE.MDC_NOTI_CONFIG); // event-type
  buffer.setUint16(20, 4); // length
  buffer.setUint16(22, 0x4000); // config-report-id = extended-config-start
  buffer.setUint16(24, 0); // config-result = accepted-config

  debug("Config response:", bytes2hex(new Uint8Array(buf)));

  return buffer.buffer;
};

const buildMDSAttributeRequest = (invokeId: number) => {
  const buf = new ArrayBuffer(18);
  const buffer = new DataView(buf);

  buffer.setUint16(0, APDU_TYPE.PRESENTATION_APDU);
  buffer.setUint16(2, 14); // length
  buffer.setUint16(4, 12); // octet string length
  buffer.setUint16(6, invokeId + 1); // to differentiate from previous
  buffer.setUint16(8, DATA_ADPU.INVOKE_GET);
  buffer.setUint16(10, 6); // length
  buffer.setUint16(12, 0); // handle 0
  buffer.setUint16(14, 0); // attribute-id-list.count = 0 (get all attributes)
  buffer.setUint16(16, 0); // attribute-id-list.length = 0

  debug("MDS request:", bytes2hex(new Uint8Array(buf)));

  return buffer.buffer;
};

const buildActionRequest = (invokeId: number, pmStoreHandle: number) => {
  const buf = new ArrayBuffer(24);
  const buffer = new DataView(buf);

  buffer.setUint16(0, APDU_TYPE.PRESENTATION_APDU);
  buffer.setUint16(2, 20); // length
  buffer.setUint16(4, 18); // octet string length
  buffer.setUint16(6, invokeId + 1); // invoke-id
  buffer.setUint16(8, DATA_ADPU.INVOKE_CONFIRMED_ACTION);
  buffer.setUint16(12, pmStoreHandle);
  buffer.setUint16(14, ACTION_TYPE.MDC_ACT_SEG_GET_INFO);
  buffer.setUint16(16, 6); // length
  buffer.setUint16(18, 1); // all-segments
  buffer.setUint16(20, 2); // length
  buffer.setUint16(22, 0);

  debug("Action request:", bytes2hex(new Uint8Array(buf)));

  return buffer.buffer;
};

const buildSetTimeRequest = (invokeId: number, timestamp: bigint) => {
  const buf = new ArrayBuffer(30);
  const buffer = new DataView(buf);

  buffer.setUint16(0, APDU_TYPE.PRESENTATION_APDU);
  buffer.setUint16(2, 26); // length
  buffer.setUint16(4, 24); // octet string length
  buffer.setUint16(6, invokeId + 1); // invoke-id
  buffer.setUint16(8, DATA_ADPU.INVOKE_CONFIRMED_ACTION);
  buffer.setUint16(10, 18); // length
  buffer.setUint16(12, 0);
  buffer.setUint16(14, ACTION_TYPE.MDC_ACT_SEG_SET_TIME);
  buffer.setUint16(16, 12); // length
  buffer.setBigUint64(18, timestamp); // AbsoluteTime
  buffer.setUint32(26, 0); // accuracy (FLOAT-type, set to zero)

  debug("Set time request:", bytes2hex(new Uint8Array(buf)));

  return buffer.buffer;
};

const buildDataTransferRequest = (
  invokeId: number,
  pmStoreHandle: number,
  segment: number
) => {
  const buf = new ArrayBuffer(20);
  const buffer = new DataView(buf);

  buffer.setUint16(0, APDU_TYPE.PRESENTATION_APDU);
  buffer.setUint16(2, 16); // length
  buffer.setUint16(4, 14); // octet string length
  buffer.setUint16(6, invokeId + 1); // invoke-id
  buffer.setUint16(8, DATA_ADPU.INVOKE_CONFIRMED_ACTION);
  buffer.setUint16(10, 8); // length
  buffer.setUint16(12, pmStoreHandle);
  buffer.setUint16(14, ACTION_TYPE.MDC_ACT_SEG_TRIG_XFER);
  buffer.setUint16(16, 2); // length
  buffer.setUint16(18, segment); // segment

  debug("Data transfer request:", bytes2hex(new Uint8Array(buf)));

  return buffer.buffer;
};

const buildDataTransferConfirmation = (
  invokeId: number,
  pmStoreHandle: number,
  segmentDataResult: DataView
) => {
  const buf = new ArrayBuffer(34);
  const buffer = new DataView(buf);

  buffer.setUint16(0, APDU_TYPE.PRESENTATION_APDU);
  buffer.setUint16(2, 30); // length
  buffer.setUint16(4, 28); // octet string length
  buffer.setUint16(6, invokeId);
  buffer.setUint16(8, DATA_ADPU.RESPONSE_CONFIRMED_EVENT_REPORT);
  buffer.setUint16(10, 22); // length
  buffer.setUint16(12, pmStoreHandle);
  buffer.setUint32(14, 0xffffffff); // relative time
  buffer.setUint16(18, EVENT_TYPE.MDC_NOTI_SEGMENT_DATA);
  buffer.setUint16(20, 12); // length
  buffer.setUint32(22, segmentDataResult.getUint32(0));
  buffer.setUint32(26, segmentDataResult.getUint32(4));
  buffer.setUint16(30, segmentDataResult.getUint16(8)); // number of entries
  buffer.setUint16(32, 0x0080); // confirmed

  debug("Data transfer confirmation:", bytes2hex(new Uint8Array(buf)));

  return buffer.buffer;
};

const release = async (usbConfig: USBDeviceAndConfig) => {
  try {
    await usbConfig.usbDevice.transferOut(
      usbConfig.outEPnum,
      buildAssociationReleaseRequest()
    );
    const incoming = await usbConfig.usbDevice.transferIn(
      usbConfig.inEPnum,
      1024
    );
    debug(
      "Release response:",
      bytes2hex(new Uint8Array(incoming.data!.buffer))
    );
  } catch (error) {
    debug("Could not release device successfully.");
  }
};

const close = async (usbDevice: USBDevice) => {
  await usbDevice.releaseInterface(0);
  await usbDevice.close();
};

const f2 = (t: number) => (t < 10 ? `0${t}` : `${t}`);
const formatDateObject = (date: Date) =>
  `${date.getFullYear()}-${f2(date.getMonth() + 1)}-${f2(date.getDate())}T${f2(
    date.getHours()
  )}:${f2(date.getMinutes())}`;

const parseConfig = (result: ConfigData) => {
  const decoder = new TextDecoder();

  const deviceDetails = getAttributeList(result.deviceDetails);
  const modelStr = decoder.decode(
    getAttribute(deviceDetails, MDC_PART_OBJ.MDC_ATTR_ID_MODEL)!
  );

  const re = /(\d+)/g;
  const modelNumber = re.exec(modelStr)![0];
  const modelName = getModelName(+modelNumber); // for metrics
  debug("Detected as:", modelName);

  const productionSpec = getAttribute(
    deviceDetails,
    MDC_PART_OBJ.MDC_ATTR_ID_PROD_SPECN
  );
  const serialNumberStr = decoder.decode(
    getProductionSpecEntry(productionSpec!, "serial-number")!
  );

  const serialNumber = re.exec(serialNumberStr)![0];

  const timestamp = getAttribute(deviceDetails, MDC_PART_OBJ.MDC_ATTR_TIME_ABS);
  const deviceTime = formatTimestamp(
    bytes2hex(new Uint8Array(timestamp!.buffer))
  );
  return {
    modelNumber,
    modelName,
    serialNumber,
    deviceTime,
    systemTime: formatDateObject(new Date()),
  };
};

// SUBSYSTEM=="usb", SYSFS{idVendor}=="173a", SYSFS{idProduct}=="21d5", ACTION=="add", MODE="0666"

/** Supported device ids */
const filters = [{ vendorId: 0x173a, productId: 0x21d5 }];

export const readFromDevice = async () => {
  const usbDevice = await navigator.usb.requestDevice({
    filters,
  });
  const usbConfig = await openDevice(usbDevice);
  try {
    const config = await getConfig(usbConfig);
    const parsedConfig = parseConfig(config);
    const pages = await getData(
      usbConfig,
      config.lastInvokeId,
      config.pmStoreHandle
    );
    const parsedData = parseData(pages);
    return {
      config: parsedConfig,
      data: parsedData,
    };
  } finally {
    await release(usbConfig);
    await close(usbDevice);
  }
};
