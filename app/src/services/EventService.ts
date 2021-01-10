import typeorm, { getRepository } from "typeorm";
import Event from '../entities/Event';
import Attendance from '../entities/Attendance';
import { ConflictStatus, ForbiddenStatus } from "../utils/HTTPStatuses";
import { HTTPError } from "../utils/HTTPError";
import MappingEntityFactory from "../factories/MappingEntityFactory";
import ValidationHelper from "../utils/ValidationHelper";
import { AttendanceType } from "../enums/AttendanceType";

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
            throw new HTTPError(ForbiddenStatus)
        }
        return event;
    };

    updateAttendance = async (userId: string, eventId: string, attendanceType: AttendanceType) => {
        const attendance = await this.attendanceRepository.findOne({ where: { user: userId, event: eventId } });
        if (attendance === undefined) {
            throw new HTTPError(ForbiddenStatus)
        };
        attendance.attendanceType = attendanceType;
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
                throw new HTTPError(ConflictStatus);
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
        attendances.filter(attendance => (attendance.attendanceType === AttendanceType.ATTENDING || attendance.attendanceType === AttendanceType.HOPEFULLY))
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