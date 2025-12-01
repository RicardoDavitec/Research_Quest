-- Script de criação das tabelas baseado no schema Prisma
USE campo_research_db;
GO

-- Tabela de Roles
IF OBJECT_ID('roles', 'U') IS NOT NULL DROP TABLE roles;
CREATE TABLE roles (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    name NVARCHAR(50) UNIQUE NOT NULL,
    description NVARCHAR(255),
    isActive BIT NOT NULL DEFAULT 1,
    createdAt DATETIME2 NOT NULL DEFAULT GETDATE(),
    updatedAt DATETIME2 NOT NULL DEFAULT GETDATE()
);

-- Tabela de Institutions
IF OBJECT_ID('institutions', 'U') IS NOT NULL DROP TABLE institutions;
CREATE TABLE institutions (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    name NVARCHAR(200) NOT NULL,
    acronym NVARCHAR(50),
    type NVARCHAR(100) NOT NULL,
    cnpj NVARCHAR(20) UNIQUE NOT NULL,
    address NVARCHAR(200),
    city NVARCHAR(100),
    state NVARCHAR(2),
    zipCode NVARCHAR(10),
    phone NVARCHAR(20),
    email NVARCHAR(150),
    website NVARCHAR(200),
    rector NVARCHAR(100),
    description TEXT,
    isActive BIT NOT NULL DEFAULT 1,
    createdAt DATETIME2 NOT NULL DEFAULT GETDATE(),
    updatedAt DATETIME2 NOT NULL DEFAULT GETDATE()
);

-- Tabela de Research Projects
IF OBJECT_ID('research_projects', 'U') IS NOT NULL DROP TABLE research_projects;
CREATE TABLE research_projects (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    name NVARCHAR(200) NOT NULL,
    code NVARCHAR(50),
    codeUUID UNIQUEIDENTIFIER UNIQUE NOT NULL DEFAULT NEWID(),
    description TEXT,
    area NVARCHAR(100),
    startDate DATE,
    endDate DATE,
    status NVARCHAR(50) NOT NULL DEFAULT 'active',
    budget DECIMAL(15, 2),
    fundingAgency NVARCHAR(100),
    objectives TEXT,
    expectedResults TEXT,
    isActive BIT NOT NULL DEFAULT 1,
    createdAt DATETIME2 NOT NULL DEFAULT GETDATE(),
    updatedAt DATETIME2 NOT NULL DEFAULT GETDATE(),
    institutionId UNIQUEIDENTIFIER,
    responsibleResearcherId UNIQUEIDENTIFIER,
    FOREIGN KEY (institutionId) REFERENCES institutions(id)
);

-- Tabela de Subgroups
IF OBJECT_ID('subgroups', 'U') IS NOT NULL DROP TABLE subgroups;
CREATE TABLE subgroups (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    name NVARCHAR(100) UNIQUE NOT NULL,
    description NVARCHAR(500),
    isActive BIT NOT NULL DEFAULT 1,
    createdAt DATETIME2 NOT NULL DEFAULT GETDATE(),
    updatedAt DATETIME2 NOT NULL DEFAULT GETDATE(),
    researchProjectId UNIQUEIDENTIFIER,
    FOREIGN KEY (researchProjectId) REFERENCES research_projects(id) ON DELETE NO ACTION ON UPDATE NO ACTION
);

-- Tabela de Researchers
IF OBJECT_ID('researchers', 'U') IS NOT NULL DROP TABLE researchers;
CREATE TABLE researchers (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    name NVARCHAR(150) NOT NULL,
    email NVARCHAR(150) UNIQUE NOT NULL,
    password NVARCHAR(255) NOT NULL,
    role NVARCHAR(50) NOT NULL DEFAULT 'researcher',
    isActive BIT NOT NULL DEFAULT 1,
    phone NVARCHAR(20),
    institution NVARCHAR(100),
    createdAt DATETIME2 NOT NULL DEFAULT GETDATE(),
    updatedAt DATETIME2 NOT NULL DEFAULT GETDATE(),
    researchProjectId UNIQUEIDENTIFIER,
    subgroupId UNIQUEIDENTIFIER,
    roleId UNIQUEIDENTIFIER,
    FOREIGN KEY (researchProjectId) REFERENCES research_projects(id) ON DELETE NO ACTION ON UPDATE NO ACTION,
    FOREIGN KEY (subgroupId) REFERENCES subgroups(id) ON DELETE NO ACTION ON UPDATE NO ACTION,
    FOREIGN KEY (roleId) REFERENCES roles(id)
);

-- Adicionar FK de responsibleResearcherId em research_projects
ALTER TABLE research_projects ADD FOREIGN KEY (responsibleResearcherId) REFERENCES researchers(id) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- Tabela de Field Researches
IF OBJECT_ID('field_researches', 'U') IS NOT NULL DROP TABLE field_researches;
CREATE TABLE field_researches (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    name NVARCHAR(200) NOT NULL,
    code NVARCHAR(50),
    description TEXT,
    location NVARCHAR(100),
    startDate DATE,
    endDate DATE,
    status NVARCHAR(50) NOT NULL DEFAULT 'planning',
    targetSampleSize INT,
    currentSampleSize INT NOT NULL DEFAULT 0,
    methodology NVARCHAR(100),
    ethicsApproval NVARCHAR(100),
    observations TEXT,
    isActive BIT NOT NULL DEFAULT 1,
    createdAt DATETIME2 NOT NULL DEFAULT GETDATE(),
    updatedAt DATETIME2 NOT NULL DEFAULT GETDATE(),
    subgroupId UNIQUEIDENTIFIER,
    responsibleId UNIQUEIDENTIFIER,
    FOREIGN KEY (subgroupId) REFERENCES subgroups(id) ON DELETE NO ACTION ON UPDATE NO ACTION,
    FOREIGN KEY (responsibleId) REFERENCES researchers(id) ON DELETE NO ACTION ON UPDATE NO ACTION
);

-- Tabela de Questions
IF OBJECT_ID('questions', 'U') IS NOT NULL DROP TABLE questions;
CREATE TABLE questions (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    text NVARCHAR(1000) NOT NULL,
    type NVARCHAR(50) NOT NULL,
    visibility NVARCHAR(50) NOT NULL DEFAULT 'subgroup',
    objective NVARCHAR(500),
    targetAudience NVARCHAR(500),
    targetGender NVARCHAR(50) NOT NULL DEFAULT 'all',
    targetEducationLevel NVARCHAR(50) NOT NULL DEFAULT 'all',
    minAge INT,
    maxAge INT,
    targetLocation NVARCHAR(200),
    options TEXT,
    isActive BIT NOT NULL DEFAULT 1,
    createdAt DATETIME2 NOT NULL DEFAULT GETDATE(),
    updatedAt DATETIME2 NOT NULL DEFAULT GETDATE(),
    authorId UNIQUEIDENTIFIER NOT NULL,
    subgroupId UNIQUEIDENTIFIER,
    FOREIGN KEY (authorId) REFERENCES researchers(id) ON DELETE NO ACTION ON UPDATE NO ACTION,
    FOREIGN KEY (subgroupId) REFERENCES subgroups(id) ON DELETE NO ACTION ON UPDATE NO ACTION
);

-- Tabela de Questionnaires
IF OBJECT_ID('questionnaires', 'U') IS NOT NULL DROP TABLE questionnaires;
CREATE TABLE questionnaires (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    title NVARCHAR(200) NOT NULL,
    description NVARCHAR(1000),
    isActive BIT NOT NULL DEFAULT 1,
    createdAt DATETIME2 NOT NULL DEFAULT GETDATE(),
    updatedAt DATETIME2 NOT NULL DEFAULT GETDATE(),
    creatorId UNIQUEIDENTIFIER NOT NULL,
    subgroupId UNIQUEIDENTIFIER NOT NULL,
    fieldResearchId UNIQUEIDENTIFIER,
    FOREIGN KEY (creatorId) REFERENCES researchers(id) ON DELETE NO ACTION ON UPDATE NO ACTION,
    FOREIGN KEY (fieldResearchId) REFERENCES field_researches(id) ON DELETE NO ACTION ON UPDATE NO ACTION
);

-- Tabela many-to-many Questionnaires <-> Questions
IF OBJECT_ID('_QuestionnaireQuestions', 'U') IS NOT NULL DROP TABLE _QuestionnaireQuestions;
CREATE TABLE _QuestionnaireQuestions (
    A UNIQUEIDENTIFIER NOT NULL,
    B UNIQUEIDENTIFIER NOT NULL,
    FOREIGN KEY (A) REFERENCES questionnaires(id) ON DELETE CASCADE,
    FOREIGN KEY (B) REFERENCES questions(id) ON DELETE CASCADE,
    CONSTRAINT PK_QuestionnaireQuestions PRIMARY KEY (A, B)
);

-- Tabela de Question Sequences
IF OBJECT_ID('question_sequences', 'U') IS NOT NULL DROP TABLE question_sequences;
CREATE TABLE question_sequences (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    [order] INT NOT NULL,
    isRequired BIT NOT NULL DEFAULT 1,
    isActive BIT NOT NULL DEFAULT 1,
    createdAt DATETIME2 NOT NULL DEFAULT GETDATE(),
    updatedAt DATETIME2 NOT NULL DEFAULT GETDATE(),
    questionnaireId UNIQUEIDENTIFIER NOT NULL,
    questionId UNIQUEIDENTIFIER NOT NULL,
    FOREIGN KEY (questionnaireId) REFERENCES questionnaires(id) ON DELETE NO ACTION ON UPDATE NO ACTION,
    FOREIGN KEY (questionId) REFERENCES questions(id) ON DELETE NO ACTION ON UPDATE NO ACTION
);

-- Tabela de Surveys
IF OBJECT_ID('surveys', 'U') IS NOT NULL DROP TABLE surveys;
CREATE TABLE surveys (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    title NVARCHAR(200) NOT NULL,
    description NVARCHAR(1000),
    objectives NVARCHAR(1000),
    targetAudience NVARCHAR(500),
    locations NVARCHAR(500),
    startDate DATETIME2,
    endDate DATETIME2,
    applicationMethod NVARCHAR(50) NOT NULL,
    status NVARCHAR(50) NOT NULL DEFAULT 'planning',
    estimatedResponses INT,
    actualResponses INT NOT NULL DEFAULT 0,
    budget DECIMAL(15, 2),
    notes TEXT,
    isActive BIT NOT NULL DEFAULT 1,
    createdAt DATETIME2 NOT NULL DEFAULT GETDATE(),
    updatedAt DATETIME2 NOT NULL DEFAULT GETDATE(),
    questionnaireId UNIQUEIDENTIFIER NOT NULL,
    coordinatorId UNIQUEIDENTIFIER NOT NULL,
    FOREIGN KEY (questionnaireId) REFERENCES questionnaires(id) ON DELETE NO ACTION ON UPDATE NO ACTION,
    FOREIGN KEY (coordinatorId) REFERENCES researchers(id) ON DELETE NO ACTION ON UPDATE NO ACTION
);

PRINT 'Todas as tabelas criadas com sucesso!';
