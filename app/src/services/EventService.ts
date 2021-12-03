import typeorm, { getRepository } from "typeorm";
import Event from '../entities/Event';
import Attendance from '../entities/Attendance';
import { ConflictStatus, ForbiddenStatus } from "../utils/HTTPStatuses";
import { HTTPError } from "../utils/HTTPError";
import MappingEntityFactory from "../factories/MappingEntityFactory";
import ValidationHelper from "../utils/ValidationHelper";
import { AttendanceStatus } from "../enums/AttendanceStatus";

class EventService {

    private eventRepository: typeorm.Repository<Event>;
    private attendanceRepository: typeorm.Repository<Attendance>;
    private static instance: EventService;

    private constructor() {
        this.eventRepository = getRepository(Event);
        this.attendanceRepository = getRepository(Attendance);
    };

    static getInstance = (): EventService => {
        if (!EventService.instance) {
            EventService.instance = new EventService();
        }
        return EventService.instance;
    };

    getEvent = async (eventId: string): Promise<Event> => {
        const event = await this.eventRepository.findOne({ where: { id: eventId } });
        if (event === undefined) {
            throw new HTTPError(ForbiddenStatus, 'getEvent - could not find event by Id', { eventId })
        }
        return event;
    };

    getAttendance = async (userId: string, eventId: string): Promise<Attendance> => {
        const attendance = await this.attendanceRepository.findOne({ where: { user: userId, event: eventId } });
        if (attendance === undefined) {
            throw new HTTPError(ForbiddenStatus, 'getAttendance - could not find attendance by eventId & userId', { eventId, userId });
        }
        return attendance;
    }

    getAttendances = async (eventId: string): Promise<Attendance[]> => {
        return await this.attendanceRepository.find({ where: { event: eventId } });
    }

    createAttendance = async (attendance: Attendance): Promise<void> => {
        const existingAttendance = await this.attendanceRepository.findOne({ where: { user: attendance.user, event: attendance.event } });
        if (!!existingAttendance) {
            throw new HTTPError(ConflictStatus, 'createAttendance - cannot create attendance because already exists', { existingAttendance });
        }
        await this.attendanceRepository.save(attendance);
    }

    updateAttendance = async (userId: string, eventId: string, attendanceStatus: AttendanceStatus) => {
        const attendance = await this.attendanceRepository.findOne({ where: { user: userId, event: eventId } });
        if (attendance === undefined) {
            throw new HTTPError(ForbiddenStatus, 'updateAttendance - cannot update attendance because doesn\'t exist', { userId, eventId });
        };
        attendance.AttendanceStatus = attendanceStatus;
        await this.eventRepository.update(attendance.id, attendance);
    }

    getEventsForCommunity = async (communityId: string): Promise<Event[]> => {
        return await this.eventRepository.find({ where: { community: communityId } });
    };

    getInviteEventsForUser = async (userId: string): Promise<Event[]> => {
        const attendances = await this.attendanceRepository.find({ where: { user: userId } });
        const eventPromises = attendances.map(async attendance => {
            return this.eventRepository.findOne({ where: { id: attendance.event } })
        });
        const events = await Promise.all(eventPromises).catch( err => { throw err })
        return events.filter(this.notEmpty);
    };

    inviteUsersToEvent = async (eventId: string, invitees: string[]): Promise<void> => {
        const attendancePromises = invitees.map(async invitee => {
            const attendance = MappingEntityFactory.makeInvitedAttendance(eventId, invitee);
            await ValidationHelper.validateEntity(attendance);
            return attendance;
        })
        const attendances = await Promise.all(attendancePromises).catch( err => { throw err });
        const validationPromises = attendances.map(async attendance => {
            const existingAttendance = await this.attendanceRepository.findOne({ where: { user: attendance.user, event: attendance.event } });
            if (!!existingAttendance) {
                throw new HTTPError(ConflictStatus, 'inviteUsersToEvent - failed to invite user to event because invite already exists', { existingAttendance });
            }
        })
        await Promise.all(validationPromises).catch( err => { throw err });
        const savePromises = attendances.map(async attendance => {
            await this.attendanceRepository.save(attendance);
        })
        await Promise.all(savePromises).catch( err => { throw err });
    };

    getEventExpectedAttendanceUserIds = async (eventId: string): Promise<string[]> => {
        const attendances = await this.attendanceRepository.find({ where: { event: eventId } });
        attendances.filter(attendance => (attendance.AttendanceStatus === AttendanceStatus.ATTENDING || attendance.AttendanceStatus === AttendanceStatus.HOPEFULLY))
        return attendances.map(attendance => attendance.user);
    }

    saveEvent = async (event: Event): Promise<void> => {
        await this.eventRepository.save(event);
    };

    updateEvent = async (event: Event): Promise<void> => {
        await this.eventRepository.update(event.id, event);
    }

    notEmpty<TValue>(value: TValue | null | undefined): value is TValue {
        return value !== null && value !== undefined;
    };

}

export default EventService;