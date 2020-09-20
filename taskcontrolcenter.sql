-- phpMyAdmin SQL Dump
-- version 4.8.3
-- https://www.phpmyadmin.net/
--
-- Хост: 127.0.0.1:3306
-- Время создания: Сен 20 2020 г., 21:01
-- Версия сервера: 8.0.12
-- Версия PHP: 5.5.38

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET AUTOCOMMIT = 0;
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- База данных: `taskcontrolcenter`
--

-- --------------------------------------------------------

--
-- Структура таблицы `members`
--

CREATE TABLE `members` (
  `id` int(11) NOT NULL,
  `login` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `role` set('Директор','Руководитель отдела','Инженер','Менеджер','Партнер') NOT NULL,
  `sectionAccessCode` varchar(255) NOT NULL,
  `departmentId` int(11) NOT NULL,
  `email` varchar(255) NOT NULL,
  `position` varchar(255) NOT NULL,
  `innerPhoneNumber` varchar(255) NOT NULL,
  `partnerCode` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Дамп данных таблицы `members`
--

INSERT INTO `members` (`id`, `login`, `password`, `name`, `role`, `sectionAccessCode`, `departmentId`, `email`, `position`, `innerPhoneNumber`, `partnerCode`) VALUES
(1, 'volovikov', '674413a', '', '', '[{name:\'Полный доступ\'}]', 1, '', '', '', '');

-- --------------------------------------------------------

--
-- Структура таблицы `membersdepartment`
--

CREATE TABLE `membersdepartment` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Дамп данных таблицы `membersdepartment`
--

INSERT INTO `membersdepartment` (`id`, `name`) VALUES
(1, 'Отдел разработки');

-- --------------------------------------------------------

--
-- Структура таблицы `sessions`
--

CREATE TABLE `sessions` (
  `session_id` varchar(128) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `expires` int(11) UNSIGNED NOT NULL,
  `data` mediumtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Дамп данных таблицы `sessions`
--

INSERT INTO `sessions` (`session_id`, `expires`, `data`) VALUES
('nJbCtkC3VusmBW5HWy6KLr4POZEE72yZ', 1600711241, '{\"cookie\":{\"originalMaxAge\":null,\"expires\":null,\"httpOnly\":true,\"path\":\"/\"},\"users\":{\"72788358\":{\"id\":1,\"login\":\"volovikov\",\"sectionAccessCode\":\"[{name:\'Полный доступ\'}]\",\"userHash\":72788358,\"cookie\":\"s:nJbCtkC3VusmBW5HWy6KLr4POZEE72yZ.vjswHDTela++2hJW8FtbPhuTE2OCsDCjBIlLwDI1vu4\"}}}');

-- --------------------------------------------------------

--
-- Структура таблицы `tasks`
--

CREATE TABLE `tasks` (
  `id` int(11) NOT NULL,
  `hasChildren` tinyint(4) NOT NULL,
  `subject` varchar(255) NOT NULL,
  `parentTaskId` int(11) NOT NULL,
  `status` enum('Новая','В работе','Решена','Закрыта','Отклонена','Отложена') NOT NULL,
  `archive` tinyint(4) NOT NULL,
  `needTime` enum('60','240','480','720','960','1200','1440','1680','1920','2160','2400') NOT NULL,
  `priority` enum('Низкий','Нормальный','Высокий','Срочный','Немедленный') NOT NULL,
  `taskInspectorId` set('1','2','3','4','5','6','7','8','9','10','11') CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `taskAuthorId` int(11) NOT NULL,
  `taskExecutorId` int(11) NOT NULL,
  `workBegin` varchar(255) NOT NULL,
  `workEnd` varchar(255) NOT NULL,
  `complete` enum('0%','10%','20%','30%','40%','50%','60%','70%','80%','90%','100%') NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Дамп данных таблицы `tasks`
--

INSERT INTO `tasks` (`id`, `hasChildren`, `subject`, `parentTaskId`, `status`, `archive`, `needTime`, `priority`, `taskInspectorId`, `taskAuthorId`, `taskExecutorId`, `workBegin`, `workEnd`, `complete`) VALUES
(1, 0, 'Новая задача', 0, 'Новая', 0, '960', 'Низкий', '1', 1, 1, '2020-09-20 00:00:00', '', '0%');

-- --------------------------------------------------------

--
-- Структура таблицы `taskschangehistory`
--

CREATE TABLE `taskschangehistory` (
  `id` int(11) NOT NULL,
  `taskId` int(11) NOT NULL,
  `changeUserId` int(11) NOT NULL,
  `changeMessage` text NOT NULL,
  `changeDate` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Дамп данных таблицы `taskschangehistory`
--

INSERT INTO `taskschangehistory` (`id`, `taskId`, `changeUserId`, `changeMessage`, `changeDate`) VALUES
(1, 1, 1, 'Пользователь undefined изменил предполагаемое время работы на 1h', '2020-09-20 20:44:17'),
(2, 1, 1, 'Пользователь undefined изменил предполагаемое время работы на 1h', '2020-09-20 20:45:15'),
(3, 1, 1, 'Пользователь undefined изменил предполагаемое время работы на 1h', '2020-09-20 20:48:08'),
(4, 1, 1, 'Пользователь undefined изменил предполагаемое время работы на 1h', '2020-09-20 20:49:56'),
(5, 1, 1, 'Пользователь undefined изменил предполагаемое время работы на 1h', '2020-09-20 20:53:21'),
(6, 1, 1, 'Пользователь undefined изменил предполагаемое время работы на 1h', '2020-09-20 20:53:59'),
(7, 1, 1, 'Пользователь undefined изменил предполагаемое время работы на 1h', '2020-09-20 20:54:20'),
(8, 1, 1, 'Пользователь undefined изменил предполагаемое время работы на 1h', '2020-09-20 20:54:34'),
(9, 1, 1, 'Пользователь undefined изменил предполагаемое время работы на 1h', '2020-09-20 20:56:31'),
(10, 1, 1, 'Пользователь undefined изменил предполагаемое время работы на 1h', '2020-09-20 20:57:37'),
(11, 1, 1, 'Пользователь undefined изменил предполагаемое время работы на 1h', '2020-09-20 20:58:50'),
(12, 1, 1, 'Пользователь undefined изменил предполагаемое время работы на 2d', '2020-09-20 20:59:43'),
(13, 1, 1, 'Пользователь undefined сменил свойства задачи', '2020-09-20 21:00:40');

-- --------------------------------------------------------

--
-- Структура таблицы `taskscomment`
--

CREATE TABLE `taskscomment` (
  `id` int(11) NOT NULL,
  `taskId` int(11) NOT NULL,
  `commentAuthorId` int(11) NOT NULL,
  `commentDate` datetime NOT NULL,
  `comment` text NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Дамп данных таблицы `taskscomment`
--

INSERT INTO `taskscomment` (`id`, `taskId`, `commentAuthorId`, `commentDate`, `comment`) VALUES
(1, 1, 1, '2020-09-20 00:00:00', 'Новая задача. Нужно сделать ');

-- --------------------------------------------------------

--
-- Структура таблицы `tasksuserread`
--

CREATE TABLE `tasksuserread` (
  `id` int(11) NOT NULL,
  `taskId` int(11) NOT NULL,
  `userId` int(11) NOT NULL,
  `datetime` datetime NOT NULL,
  `parentTaskId` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Дамп данных таблицы `tasksuserread`
--

INSERT INTO `tasksuserread` (`id`, `taskId`, `userId`, `datetime`, `parentTaskId`) VALUES
(1, 1, 1, '2020-09-20 17:17:42', 0);

--
-- Индексы сохранённых таблиц
--

--
-- Индексы таблицы `members`
--
ALTER TABLE `members`
  ADD PRIMARY KEY (`id`),
  ADD KEY `departmentId` (`departmentId`);

--
-- Индексы таблицы `membersdepartment`
--
ALTER TABLE `membersdepartment`
  ADD PRIMARY KEY (`id`);

--
-- Индексы таблицы `sessions`
--
ALTER TABLE `sessions`
  ADD PRIMARY KEY (`session_id`);

--
-- Индексы таблицы `tasks`
--
ALTER TABLE `tasks`
  ADD PRIMARY KEY (`id`),
  ADD KEY `parentTaskId` (`parentTaskId`),
  ADD KEY `taskAuthorId` (`taskAuthorId`),
  ADD KEY `taskExecutorId` (`taskExecutorId`);

--
-- Индексы таблицы `taskschangehistory`
--
ALTER TABLE `taskschangehistory`
  ADD PRIMARY KEY (`id`),
  ADD KEY `taskId` (`taskId`),
  ADD KEY `changeUserId` (`changeUserId`);

--
-- Индексы таблицы `taskscomment`
--
ALTER TABLE `taskscomment`
  ADD PRIMARY KEY (`id`),
  ADD KEY `taskId` (`taskId`),
  ADD KEY `commentAuthorId` (`commentAuthorId`);

--
-- Индексы таблицы `tasksuserread`
--
ALTER TABLE `tasksuserread`
  ADD PRIMARY KEY (`id`),
  ADD KEY `taskId` (`taskId`),
  ADD KEY `userId` (`userId`),
  ADD KEY `parentTaskId` (`parentTaskId`);

--
-- AUTO_INCREMENT для сохранённых таблиц
--

--
-- AUTO_INCREMENT для таблицы `members`
--
ALTER TABLE `members`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT для таблицы `membersdepartment`
--
ALTER TABLE `membersdepartment`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT для таблицы `tasks`
--
ALTER TABLE `tasks`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT для таблицы `taskschangehistory`
--
ALTER TABLE `taskschangehistory`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- AUTO_INCREMENT для таблицы `taskscomment`
--
ALTER TABLE `taskscomment`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT для таблицы `tasksuserread`
--
ALTER TABLE `tasksuserread`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
