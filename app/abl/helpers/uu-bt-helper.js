"use strict";
const { UuAppWorkspace } = require("uu_appg01_server").Workspace;
const { AppClient } = require("uu_appg01_server-client");
const { UriBuilder } = require("uu_appg01_core-uri");

const BT_CONFIG = {
  typeCode: "uu-schoolkit-schoolg01",
};

const AWSC_PREFIXES = {
  codePrefix: "uuBaseRegistry/",
  codePostfix: "/uuAwsc",
};

const BT_COMMANDS = {
  uuAppMetaModel: {
    get: "/uuAppMetaModel/get",
  },
  uuAwsc: {
    get: "/uuAwsc/get",
    create: "/uuAwsc/create",
    loadEnvironment: "/uuAwsc/loadEnvironment",
    synchronizeArtifactAttributes: "/uuAwsc/synchronizeArtifactAttributes",
    setState: "/uuAwsc/setState",
    setBasicAttributes: "uuAwsc/setBasicAttributes",
  },
  uuObc: {
    synchronize: "/uuObc/synchronizeArtifactAttributes",
    setBasicAttributes: "/uuObc/setBasicAttributes",
    loadEnvironment: "/uuObc/loadEnvironment",
    delete: "/uuObc/delete",
    listAarByArtifactA: "/uuObc/listAarByArtifactA",
    create: "/uuObc/create",
    authorizeMe: "/uuObc/authorizeMe",
    setState: "/uuObc/setState",
  },
  uuFolder: {
    create: "uuFolder/create",
    get: "uuFolder/get",
    load: "uuFolder/load",
    getNavigation: "uuFolder/getNavigation",
    setBasicAttributes: "uuFolder/setBasicAttributes",
  },
  uuUnit: {
    create: "uuUnit/create",
    setResponsibleRole: "uuUnit/setResponsibleRole",
    loadEnvironment: "uuUnit/loadEnvironment",
    setBasicAttributes: "uuUnit/setBasicAttributes",
  },
  uuRole: {
    create: "uuRole/create",
    addCast: "uuRole/addCast",
    listCastsBySideB: "uuRoleIfc/listCastsBySideB",
    get: "uuRole/get",
  },
  uuRoleIfc: {
    get: "uuRoleIfc/get",
  },
  uuArtifactIfc: {
    aarCreate: "uuArtifactIfc/aar/create",
    aarDelete: "uuArtifactIfc/aar/delete",
    listByArtifactB: "uuArtifactIfc/aar/listByArtifactB",
    listByArtifactA: "uuArtifactIfc/aar/listByArtifactA",
    setPermissions: "uuArtifactIfc/setPermissions",
    listMyRoles: "uuArtifactIfc/listMyRoles",
    listActivities: "uuArtifactIfc/listActivities",
  },
  verifyMyCastExistence: "verifyMyCastExistence",
};

let UuBtHelper = {
  btCommands: BT_COMMANDS,
  awscPrefixes: AWSC_PREFIXES,

  uuRoleIfc: {
    async get(uri, dtoIn, callOpts) {
      uri = UriBuilder.parse(uri).setUseCase(BT_COMMANDS.uuRoleIfc.get).clearParameters();
      let code = BT_CONFIG.typeCode;

      return await AppClient.get(uri.toString(), dtoIn, callOpts);
    },
  },

  uuAppMetaModel: {
    async get(uri, callOpts) {
      uri = UriBuilder.parse(uri).setUseCase(BT_COMMANDS.uuAppMetaModel.get).clearParameters();
      let code = BT_CONFIG.typeCode;

      return await AppClient.get(uri.toString(), { code: code }, callOpts);
    },
  },
  uuArtifactIfc: {
    async createAar(uri, dtoIn, callOpts) {
      uri = UriBuilder.parse(uri).setUseCase(BT_COMMANDS.uuArtifactIfc.aarCreate).clearParameters();
      return await AppClient.post(uri.toString(), dtoIn || {}, callOpts);
    },

    async deleteAar(uri, dtoIn, callOpts) {
      uri = UriBuilder.parse(uri).setUseCase(BT_COMMANDS.uuArtifactIfc.aarDelete).clearParameters();
      return await AppClient.post(uri.toString(), dtoIn || {}, callOpts);
    },

    async listByArtifactA(uri, dtoIn, callOpts) {
      uri = UriBuilder.parse(uri).setUseCase(BT_COMMANDS.uuArtifactIfc.listByArtifactA).clearParameters();

      return await AppClient.get(uri.toString(), dtoIn || {}, callOpts);
    },

    async listByArtifactB(uri, dtoIn, callOpts) {
      uri = UriBuilder.parse(uri).setUseCase(BT_COMMANDS.uuArtifactIfc.listByArtifactB).clearParameters();

      return await AppClient.get(uri.toString(), dtoIn || {}, callOpts);
    },
    async setPermissions(uri, dtoIn, callOpts) {
      uri = UriBuilder.parse(uri).setUseCase(BT_COMMANDS.uuArtifactIfc.setPermissions).clearParameters();

      return await AppClient.post(uri.toString(), dtoIn || {}, callOpts);
    },
    async listMyRoles(uri, dtoIn, callOpts) {
      uri = UriBuilder.parse(uri).setUseCase(BT_COMMANDS.uuArtifactIfc.listMyRoles).clearParameters();
      return await AppClient.get(uri.toString(), dtoIn || {}, callOpts);
    },
    async listActivities(uri, dtoIn, callOpts) {
      uri = UriBuilder.parse(uri).setUseCase(BT_COMMANDS.uuArtifactIfc.listActivities).clearParameters();
      return await AppClient.get(uri.toString(), dtoIn || {}, callOpts);
    },
  },
  uuFolder: {
    async create(uri, dtoIn, callOpts) {
      uri = UriBuilder.parse(uri).setUseCase(BT_COMMANDS.uuFolder.create).clearParameters();
      return await AppClient.post(uri.toString(), dtoIn || {}, callOpts);
    },
    async getNavigation(uri, dtoIn, callOpts) {
      uri = UriBuilder.parse(uri).setUseCase(BT_COMMANDS.uuFolder.getNavigation).clearParameters();
      return await AppClient.get(uri.toString(), dtoIn || {}, callOpts);
    },
    async load(uri, dtoIn, callOpts) {
      uri = UriBuilder.parse(uri).setUseCase(BT_COMMANDS.uuFolder.load).clearParameters();
      return await AppClient.get(uri.toString(), dtoIn || {}, callOpts);
    },
    async get(uri, dtoIn, callOpts) {
      uri = UriBuilder.parse(uri).setUseCase(BT_COMMANDS.uuFolder.get).clearParameters();
      return await AppClient.get(uri.toString(), dtoIn || {}, callOpts);
    },
    async setBasicAttributes(uri, dtoIn, callOpts) {
      uri = UriBuilder.parse(uri).setUseCase(BT_COMMANDS.uuFolder.setBasicAttributes).clearParameters();
      return await AppClient.post(uri.toString(), dtoIn || {}, callOpts);
    },
  },
  uuAwsc: {
    async get(uuBtUri, awscId, callOpts) {
      let createAwscUrl = UriBuilder.parse(uuBtUri).setUseCase(BT_COMMANDS.uuAwsc.get).clearParameters();

      return await AppClient.get(createAwscUrl.toString(), awscId, callOpts);
    },
    async loadEnvironment(uri, loadEnvironmentDtoIn, callOpts) {
      uri = UriBuilder.parse(uri).setUseCase(BT_COMMANDS.uuAwsc.loadEnvironment).clearParameters();
      return await AppClient.get(uri.toString(), loadEnvironmentDtoIn || {}, callOpts);
    },
    async synchronizeArtifactAttributes(uri, dtoIn, callOpts) {
      uri = UriBuilder.parse(uri).setUseCase(BT_COMMANDS.uuAwsc.synchronizeArtifactAttributes).clearParameters();
      return await AppClient.post(uri.toString(), dtoIn || {}, callOpts);
    },
    async setState(uri, dtoIn, callOpts) {
      uri = UriBuilder.parse(uri).setUseCase(BT_COMMANDS.uuAwsc.setState).clearParameters();
      return await AppClient.post(uri.toString(), dtoIn || {}, callOpts);
    },

    async getAppWorkspace(awid) {
      return await UuAppWorkspace.get(awid);
    },

    async connectArtifact(appBaseUri, artifactUri, session) {
      return await UuAppWorkspace.connectArtifact(
        appBaseUri,
        { artifactUri, synchronizeArtifactBasicAttributes: true },
        session
      );
    },

    async create(uri, dtoIn, callOpts) {
      let createAwscUrl = UriBuilder.parse(uri).setUseCase(BT_COMMANDS.uuAwsc.create).clearParameters();
      let createAwcsDtoIn = {
        name: dtoIn.name,
        typeCode: BT_CONFIG.typeCode,
        location: dtoIn.location,
      };

      if (dtoIn.responsibleRoleCode) {
        createAwcsDtoIn.responsibleRoleCode = dtoIn.responsibleRoleCode;
      }

      if (dtoIn.desc) {
        createAwcsDtoIn.desc = dtoIn.desc || "";
      }

      if (dtoIn.permissionMatrix) {
        createAwcsDtoIn.permissionMatrix = dtoIn.permissionMatrix;
      }
      return await AppClient.post(createAwscUrl.toString(), createAwcsDtoIn || {}, callOpts);
    },

    async setBasicAttributes(uri, dtoIn, callOpts) {
      uri = UriBuilder.parse(uri).setUseCase(BT_COMMANDS.uuAwsc.setBasicAttributes).clearParameters();
      return await AppClient.post(uri.toString(), dtoIn || {}, callOpts);
    },
  },
  uuObc: {
    async create(uri, dtoIn, callOpts) {
      uri = UriBuilder.parse(uri).setUseCase(BT_COMMANDS.uuObc.create).clearParameters();
      return await AppClient.post(uri.toString(), dtoIn || {}, callOpts);
    },
    async synchronize(uri, dtoIn, callOpts) {
      uri = UriBuilder.parse(uri).setUseCase(BT_COMMANDS.uuObc.synchronize).clearParameters();
      return await AppClient.post(uri.toString(), dtoIn || {}, callOpts);
    },
    async setBasicAttributes(uri, dtoIn, callOpts) {
      uri = UriBuilder.parse(uri).setUseCase(BT_COMMANDS.uuObc.setBasicAttributes).clearParameters();
      return await AppClient.post(uri.toString(), dtoIn || {}, callOpts);
    },
    async loadEnvironment(uri, loadEnvironmentDtoIn, callOpts) {
      uri = UriBuilder.parse(uri).setUseCase(BT_COMMANDS.uuObc.loadEnvironment).clearParameters();
      let dtoIn = { ...(loadEnvironmentDtoIn || {}), loadContext: true };
      return await AppClient.get(uri.toString(), dtoIn, callOpts);
    },
    async delete(uri, dtoIn, callOpts) {
      uri = UriBuilder.parse(uri).setUseCase(BT_COMMANDS.uuObc.delete).clearParameters();
      return await AppClient.post(uri.toString(), dtoIn || {}, callOpts);
    },
    async listAarByArtifactA(uri, dtoIn, callOpts) {
      uri = UriBuilder.parse(uri).setUseCase(BT_COMMANDS.uuObc.listAarByArtifactA).clearParameters();
      return await AppClient.get(uri.toString(), dtoIn || {}, callOpts);
    },
    async authorizeMe(uri, dtoIn, callOpts) {
      uri = UriBuilder.parse(uri).setUseCase(BT_COMMANDS.uuObc.authorizeMe).clearParameters();
      return await AppClient.get(uri.toString(), dtoIn || {}, callOpts);
    },
    async setState(uri, dtoIn, callOpts) {
      uri = UriBuilder.parse(uri).setUseCase(BT_COMMANDS.uuObc.setState).clearParameters();
      return await AppClient.post(uri.toString(), dtoIn || {}, callOpts);
    },
  },
  uuUnit: {
    async create(uri, dtoIn, callOpts) {
      uri = UriBuilder.parse(uri).setUseCase(BT_COMMANDS.uuUnit.create).clearParameters();
      return await AppClient.post(uri.toString(), dtoIn || {}, callOpts);
    },
    async setBasicAttributes(uri, dtoIn, callOpts) {
      uri = UriBuilder.parse(uri).setUseCase(BT_COMMANDS.uuUnit.setBasicAttributes).clearParameters();
      return await AppClient.post(uri.toString(), dtoIn || {}, callOpts);
    },
    async setResponsibleRole(uri, dtoIn, callOpts) {
      uri = UriBuilder.parse(uri).setUseCase(BT_COMMANDS.uuUnit.setResponsibleRole).clearParameters();
      return await AppClient.post(uri.toString(), dtoIn || {}, callOpts);
    },
    async loadEnvironment(uri, dtoIn, callOpts) {
      uri = UriBuilder.parse(uri).setUseCase(BT_COMMANDS.uuUnit.loadEnvironment).clearParameters();
      return await AppClient.get(uri.toString(), dtoIn || {}, callOpts);
    },
  },
  uuRole: {
    async create(uri, dtoIn, callOpts) {
      uri = UriBuilder.parse(uri).setUseCase(BT_COMMANDS.uuRole.create).clearParameters();
      return await AppClient.post(uri.toString(), dtoIn || {}, callOpts);
    },
    async addCast(uri, dtoIn, callOpts) {
      uri = UriBuilder.parse(uri).setUseCase(BT_COMMANDS.uuRole.addCast).clearParameters();
      return await AppClient.post(uri.toString(), dtoIn || {}, callOpts);
    },
    async listCastsBySideB(uri, dtoIn, callOpts) {
      uri = UriBuilder.parse(uri).setUseCase(BT_COMMANDS.uuRole.listCastsBySideB).clearParameters();
      return await AppClient.get(uri.toString(), dtoIn || {}, callOpts);
    },
    async get(uri, dtoIn, callOpts) {
      uri = UriBuilder.parse(uri).setUseCase(BT_COMMANDS.uuRole.get).clearParameters();
      return await AppClient.get(uri.toString(), dtoIn || {}, callOpts);
    },
  },
  verifyMyCastExistence: async (uri, dtoIn, callOpts) => {
    uri = UriBuilder.parse(uri).setUseCase(BT_COMMANDS.verifyMyCastExistence).clearParameters();
    return await AppClient.get(uri.toString(), dtoIn || {}, callOpts);
  },
};

module.exports = UuBtHelper;
