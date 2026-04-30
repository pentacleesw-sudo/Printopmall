
export const SIZES = ['46판', '신국판', '46배판', '국배판', '직접 입력'];
export const COVER_PAPERS = ['스노우', '아트지', '모조지', '아르떼 울트라화이트', '아르떼 내츄럴화이트', '앙상블E-Class EW', '랑데뷰 울트라화이트', '랑데뷰 내츄럴화이트', '백모조', '아트', '직접 입력'];
export const COVER_PAPER_WEIGHTS = {
  '스노우': ['150', '180', '200', '210', '250', '300'],
  '아트지': ['150', '180', '200', '250', '300'],
  '모조지': ['150', '180', '200', '250'],
  '백모조': ['150', '180', '200', '250'],
  '아트': ['150', '200', '250', '300']
};
export const INNER_PAPERS = ['백색 모조지', '미색 모조지', '백색 에스플러스', '미색 에스플러스', '백색 아트지', '백색 스노우', '직접 입력'];
export const BINDING_TYPES = ['무선 제본', '스프링', '중철', '세로 좌철', '가로 좌철', '세로 우철'];
export const COATING_TYPES = ['무광', '유광', '엠보', '벨벳', '코팅없음'];
export const PRINTING_TYPES = ['1도', '2도', '4도'];
export const ENDPAPER_TYPES = ['없음', '제물면지', '베다인쇄'];
export const FOIL_TYPES = ['없음', '유광 금박', '무광 금박', '유광 은박', '무광 은박', '청박', '적박', '먹박', '홀로그램박'];

export const INITIAL_STATE = {
  studioSubMode: 'simple', // 'simple' or 'detailed'
  orderName: '',
  size: '신국판',
  customSize: { width: 152, height: 225 },
  quantity: 100,
  binding: '무선 제본',
  cover: {
    paper: '스노우',
    customPaper: '',
    weight: '250',
    printing: '단면 4도',
    coating: '무광',
    hasFlaps: false
  },
  innerSections: [
    {
      id: 'section-1',
      paper: '백색 모조지',
      weight: '80g',
      printing: '1도',
      pages: 200
    }
  ],
  postProcessing: {
    epoxy: false,
    endpaper: '없음',
    foil: '없음'
  },
  clientInfo: {
    name: '',
    phone: '',
    selectedClient: '',
    clientCode: '',
    publisherName: ''
  },
  deliveryInfo: {
    method: '택배',
    address: '',
    checkPublisher: '',
    managerName: '',
    contact: '',
    deliveryDate: '',
    addresses: [
      { id: 'addr-1', type: '택배', qty: 100, recipient: '', phone: '', address: '' }
    ],
    requests: ''
  },
  files: {
    cover: null,
    body: null
  }
};

const defaultPrintingPrice = {
  general: 10,
  special: 8,
  separate: {}
};

const defaultExtraCharge = {
  general: 50,
  special: 40,
  separate: {}
};

export const DEFAULT_PRICE_CONFIG = {
  ranges: [
    { id: 'r1', min: 1, max: 49, label: '소량', isSpecial: false },
    { id: 'r2', min: 50, max: 199, label: '중량', isSpecial: false },
    { id: 'r3', min: 200, max: null, label: '대량', isSpecial: true }
  ],
  pricesByRange: {
    'r1': {
      id: 'r1',
      innerPrices: { '신국판': { '1도': { general: 20, special: 18, separate: {} }, '4도': { general: 60, special: 55, separate: {} } } },
      standardCoverPrice: { general: 500, special: 450, separate: {} },
      extraCharges: {
        doubleSidedPrinting: defaultExtraCharge,
        flaps: defaultExtraCharge,
        coating: defaultExtraCharge,
        binding: defaultExtraCharge,
        endpaper: defaultExtraCharge,
        epoxy: defaultExtraCharge,
        foil: defaultExtraCharge
      }
    },
    'r2': {
      id: 'r2',
      innerPrices: { '신국판': { '1도': { general: 15, special: 13, separate: {} }, '4도': { general: 45, special: 40, separate: {} } } },
      standardCoverPrice: { general: 400, special: 350, separate: {} },
      extraCharges: {
        doubleSidedPrinting: defaultExtraCharge,
        flaps: defaultExtraCharge,
        coating: defaultExtraCharge,
        binding: defaultExtraCharge,
        endpaper: defaultExtraCharge,
        epoxy: defaultExtraCharge,
        foil: defaultExtraCharge
      }
    },
    'r3': {
      id: 'r3',
      innerPrices: { '신국판': { '1도': { general: 10, special: 8, separate: {} }, '4도': { general: 35, special: 30, separate: {} } } },
      standardCoverPrice: { general: 300, special: 250, separate: {} },
      extraCharges: {
        doubleSidedPrinting: defaultExtraCharge,
        flaps: defaultExtraCharge,
        coating: defaultExtraCharge,
        binding: defaultExtraCharge,
        endpaper: defaultExtraCharge,
        epoxy: defaultExtraCharge,
        foil: defaultExtraCharge
      }
    }
  },
  separateCompanies: []
};
